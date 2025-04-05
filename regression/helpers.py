import pytest
import pandas as pd
import os

CUR_FILE_PATH = os.path.dirname(os.path.abspath(__file__))
TEST_DATA_SUM_PATH = os.path.join(CUR_FILE_PATH, './data/Q40-Q43_MasterFile_IDCheckingLocoPathSDEBouts_Nov19_2013_workingfile_nonrepeated.xlsx')


# Hacky solution below. Try and interface it with the database (or a mock database) to ensure that we can grab random files.
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
    return (data_01_01, stats_01_01), (data_01_04, stats_01_04), (data_01_10, stats_01_10), (data_02_06, stats_02_06), (data_03_01, stats_03_01)


FILE_1, FILE_2, FILE_3, FILE_4, FILE_5 = test_data()

TEST_CASES = [FILE_1, FILE_2, FILE_3, FILE_4, FILE_5]