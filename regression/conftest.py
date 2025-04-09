import pytest
import pandas as pd
import os
from datetime import datetime
from timeit import default_timer as timer
from pathlib import Path
import re

CUR_FILE_PATH = os.path.dirname(os.path.abspath(__file__))
TEST_DATA_SUM_PATH = os.path.join(CUR_FILE_PATH, './data/Q40-Q43_MasterFile_IDCheckingLocoPathSDEBouts_Nov19_2013_workingfile_nonrepeated.xlsx')
TEST_TO_SM_MAPPING = {
    "test_homebases" : "calc_homebases",
    "test_HB1_cumulativeReturn" : "calc_HB1_cumulativeReturn",
    "test_HB1_meanDurationStops" : "calc_HB1_meanDurationStops",
    "test_HB1_meanReturn" : "calc_HB1_meanReturn",
    "test_HB1_meanExcursionStops" : "calc_HB1_meanExcursionStops",
    "test_HB1_stopDuration" : "calc_HB1_stopDuration",
    "test_HB2_stopDuration" : "calc_HB2_stopDuration",
    "test_HB2_cumulativeReturn" : "calc_HB2_cumulativeReturn",
    "test_HB1_expectedReturn" : "calc_HB1_expectedReturn",
    "test_sessionReturnTimeMean" : "calc_sessionReturnTimeMean",
    "test_sessionTotalLocalesVisited" : "calc_sessionTotalLocalesVisited",
    "test_sessionTotalStops" : "calc_sessionTotalStops",
    "test_expectedMainHomeBaseReturn" : "calc_expectedMainHomeBaseReturn",
    "test_distanceTravelled" : "calc_distanceTravelled",
    "test_boutsOfChecking" : "calc_boutsOfChecking",
}

calc_names = list(TEST_TO_SM_MAPPING.values())
timings = {}

# Hacky solution below. Try and interface it with the database (or a mock database) to ensure that we can grab random files.
@pytest.fixture
def test_data(): # Return a list of tuples of smoothed data files & their corresponding summary measures (as a dict)
    # Get smoothed data files
    data_01_01 = pd.read_excel(os.path.join(CUR_FILE_PATH, './data/Q405HT1001_02_0_0053_0015689_smoothed.xlsx'), header=None).to_numpy()
    data_01_04 = pd.read_excel(os.path.join(CUR_FILE_PATH, './data/Q405HT1001_04_0_0059_0015691_smoothed.xlsx'), header=None).to_numpy()
    data_01_10 = pd.read_excel(os.path.join(CUR_FILE_PATH, './data/Q405HT1001_10_0_0250_0015697_smoothed.xlsx'), header=None).to_numpy()
    data_02_06 = pd.read_excel(os.path.join(CUR_FILE_PATH, './data/Q405HT1002_06_2_0166_0015703_smoothed.xlsx'), header=None).to_numpy()
    data_03_01 = pd.read_excel(os.path.join(CUR_FILE_PATH, './data/Q405HT1003_01_0_0299_0015708_smoothed.xlsx'), header=None).to_numpy()

    # Get summary measures
    summ_stats = pd.read_excel(TEST_DATA_SUM_PATH)
    stats_01_01 = summ_stats.iloc[0].to_dict()
    stats_01_04 = summ_stats.iloc[3].to_dict()
    stats_01_10 = summ_stats.iloc[9].to_dict()
    stats_02_06 = summ_stats.iloc[15].to_dict()
    stats_03_01 = summ_stats.iloc[20].to_dict()
    return [(data_01_01, stats_01_01), (data_01_04, stats_01_04), (data_01_10, stats_01_10), (data_02_06, stats_02_06), (data_03_01, stats_03_01)]

@pytest.fixture(params=range(5))
def all_test_data(request, test_data):
    return test_data[request.param]


@pytest.fixture(scope="session", autouse=True)
def session_teardown(request):
    # Where the setup would go if i had one
    yield
    record_execution_times()

def record_execution_times():
    """Export the collected execution times to a CSV file"""
    timestamp = datetime.now().strftime("%Y-%m-%d_%H:%M:%S")
    filename = f"./sm_execution_times.csv"
    columns = ["Timestamp"] + calc_names

    if Path(filename).is_file(): # Check if file exists. If not, then create an empty dataframe
        sm_file = pd.read_csv(filename)
    else:
        sm_file = pd.DataFrame({}, columns=columns)

    # Add results to file
    results = {"Timestamp" : timestamp}
    for sm in calc_names:
        if sm in timings.keys():
            results[sm] = timings[sm]
        else:
            results[sm] = None
    sm_file.loc[len(sm_file)] = results

    # Save file
    sm_file.to_csv(filename, index=False)
    
    # with open(filename, 'w', newline='') as csvfile:
    #     writer = csv.writer(csvfile)
    #     writer.writerow(['Test Name', 'Function Name', 'Execution Time (s)'])
        
    #     for test_name, measurements in function_times.items():
    #         for func_name, exec_time in measurements.items():
    #             writer.writerow([test_name, func_name, exec_time])
    
    print(f"Execution times exported to {filename}")

def run_and_measure(func, *args, **kwargs):
    """Utility function to measure execution time of a function"""
    start = timer()
    result = func(*args, **kwargs)
    end = timer()
    # Execution time; rounded to the thousandth of a second
    execution_time = round(end - start, 3)
    
    # Get the current test name
    test_name = os.environ.get("PYTEST_CURRENT_TEST", "").split(" ")[0]
    true_test_name = re.search(r"(?<=::)[a-zA-Z0-9_]*?(?=\[)", test_name)
    # if not true_test_name:
    #     print("What da heck???")
    calc_name = TEST_TO_SM_MAPPING[true_test_name.group(0)]
    print(test_name)
    print(calc_name)
    
    # Store the execution time of the summary measure (+ all dependencies)
    timings[calc_name] = execution_time
    
    return result