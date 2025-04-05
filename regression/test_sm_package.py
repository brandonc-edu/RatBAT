import pytest
import SummaryMeasures.CommanderSM as csm
from SummaryMeasures.DependenciesSM import Karpov
import SummaryMeasures.FieldSM as fsm
import SummaryMeasures.FunctionalSM as fcsm
from regression.helpers import TEST_CASES
from timeit import default_timer as timer
from regression.conftest import run_and_measure

class Test_SM_Package:

    def setup_method(self, method):
        print(f"Now setting up method: {method}")
        self.interface = csm.Commander(None, "common")

    # Using commander interface & Karpov for ease of testing
    @pytest.mark.parametrize("smoothed_data, actual_summ_measures", TEST_CASES)
    def test_homebases(self, smoothed_data, actual_summ_measures):
        # Calculate home bases
        sm_deps, data_deps = Karpov.ResolveDependencies(["calc_homebases"])
        results = run_and_measure(self.interface.CalculateSummaryMeasures, smoothed_data, sm_deps, data_deps)
        print(results)

        # Compare results (main & secondary home bases match)
        assert results["calc_homebases"][0] == actual_summ_measures["KPname01"]
        assert results["calc_homebases"][1] == actual_summ_measures["KPname02"]

    @pytest.mark.parametrize("smoothed_data, actual_summ_measures", TEST_CASES)
    def test_HB1_cumulativeReturn(self, smoothed_data, actual_summ_measures):
        # Number of stop in main home base
        sm_deps, data_deps = Karpov.ResolveDependencies(["calc_HB1_cumulativeReturn"])
        results = run_and_measure(self.interface.CalculateSummaryMeasures, smoothed_data, sm_deps, data_deps)
        
        # Compare results
        assert results["calc_HB1_cumulativeReturn"] == actual_summ_measures["KPcumReturnfreq01"]

    @pytest.mark.parametrize("smoothed_data, actual_summ_measures", TEST_CASES)
    def test_HB1_meanDurationStops(self, smoothed_data, actual_summ_measures):
        # Calculate Mean Main Homebase stop duration
        sm_deps, data_deps = Karpov.ResolveDependencies(["calc_HB1_meanDurationStops"])
        results = run_and_measure(self.interface.CalculateSummaryMeasures, smoothed_data, sm_deps, data_deps)
        print(results)

        # Compare results (main & secondary home bases match)
        assert abs(actual_summ_measures["KPmeanStayTime01_s"] - results["calc_HB1_meanDurationStops"][0]) <= 1
        assert abs(actual_summ_measures["KPmeanStayTime01_lg10_s"] - results["calc_HB1_meanDurationStops"][1]) <= 1

    @pytest.mark.parametrize("smoothed_data, actual_summ_measures", TEST_CASES)
    def test_HB1_meanReturn(self, smoothed_data, actual_summ_measures):
        # Calculate Mean time to return to main home base duration
        sm_deps, data_deps = Karpov.ResolveDependencies(["calc_HB1_meanReturn"])
        results = run_and_measure(self.interface.CalculateSummaryMeasures, smoothed_data, sm_deps, data_deps)

        # Compare results
        assert abs(results["calc_HB1_meanReturn"] - actual_summ_measures["KPreturntime01_s"]) <= 1

    @pytest.mark.parametrize("smoothed_data, actual_summ_measures", TEST_CASES)
    def test_HB1_meanExcursionStops(self, smoothed_data, actual_summ_measures):
        # Calculate Mean number of stops outside of the main home base.
        sm_deps, data_deps = Karpov.ResolveDependencies(["calc_HB1_meanExcursionStops"])
        results = run_and_measure(self.interface.CalculateSummaryMeasures, smoothed_data, sm_deps, data_deps)

        # Compare results
        assert abs(results["calc_HB1_meanExcursionStops"] - actual_summ_measures["KPstopsToReturn01"]) <= 1

    @pytest.mark.parametrize("smoothed_data, actual_summ_measures", TEST_CASES)
    def test_HB1_stopDuration(self, smoothed_data, actual_summ_measures):
        # Calculate total duration of stops within the first home base
        sm_deps, data_deps = Karpov.ResolveDependencies(["calc_HB1_stopDuration"])
        results = run_and_measure(self.interface.CalculateSummaryMeasures, smoothed_data, sm_deps, data_deps)

        # Compare results
        assert abs(results["calc_HB1_stopDuration"] - actual_summ_measures["KPtotalStayTime01_s"]) <= 1

    @pytest.mark.parametrize("smoothed_data, actual_summ_measures", TEST_CASES)
    def test_HB2_stopDuration(self, smoothed_data, actual_summ_measures):
        # Calculate total duration of stops within the second home base
        sm_deps, data_deps = Karpov.ResolveDependencies(["calc_HB2_stopDuration"])
        results = run_and_measure(self.interface.CalculateSummaryMeasures, smoothed_data, sm_deps, data_deps)

        # Compare results
        assert abs(results["calc_HB2_stopDuration"] - actual_summ_measures["KPtotalStayTime02_s"]) <= 1

    @pytest.mark.parametrize("smoothed_data, actual_summ_measures", TEST_CASES)
    def test_HB2_cumulativeReturn(self, smoothed_data, actual_summ_measures):
        # Calculate total number of stops within the second home base
        sm_deps, data_deps = Karpov.ResolveDependencies(["calc_HB2_cumulativeReturn"])
        results = run_and_measure(self.interface.CalculateSummaryMeasures, smoothed_data, sm_deps, data_deps)

        # Compare results
        assert results["calc_HB2_cumulativeReturn"] == actual_summ_measures["KPcumReturnfreq02"]

    @pytest.mark.parametrize("smoothed_data, actual_summ_measures", TEST_CASES)
    def test_HB1_expectedReturn(self, smoothed_data, actual_summ_measures):
        # Calculate expected number of returns to the main home base.
        sm_deps, data_deps = Karpov.ResolveDependencies(["calc_HB1_expectedReturn"])
        results = run_and_measure(self.interface.CalculateSummaryMeasures, smoothed_data, sm_deps, data_deps)

        # Compare results
        assert abs(results["calc_HB1_expectedReturn"] - actual_summ_measures["KPexpReturnfreq01"]) <= 1

    @pytest.mark.parametrize("smoothed_data, actual_summ_measures", TEST_CASES)
    def test_sessionReturnTimeMean(self, smoothed_data, actual_summ_measures):
        # Calculate mean return time to all locales.
        sm_deps, data_deps = Karpov.ResolveDependencies(["calc_sessionReturnTimeMean"])
        results = run_and_measure(self.interface.CalculateSummaryMeasures, smoothed_data, sm_deps, data_deps)

        # Compare results
        assert abs(results["calc_sessionReturnTimeMean"] - actual_summ_measures["KP_session_ReturnTime_mean"]) <= 1

    @pytest.mark.parametrize("smoothed_data, actual_summ_measures", TEST_CASES)
    def test_expectedMainHomeBaseReturn(self, smoothed_data, actual_summ_measures):
        # Calculate mean return time to the main home base.
        sm_deps, data_deps = Karpov.ResolveDependencies(["calc_expectedMainHomeBaseReturn"])
        results = run_and_measure(self.interface.CalculateSummaryMeasures, smoothed_data, sm_deps, data_deps)

        # Compare results
        assert abs(results["calc_expectedMainHomeBaseReturn"] - actual_summ_measures["KPexpReturntime01"]) <= 1

    @pytest.mark.parametrize("smoothed_data, actual_summ_measures", TEST_CASES)
    def test_sessionTotalLocalesVisited(self, smoothed_data, actual_summ_measures):
        # Calculate total of number of locales visited (stopped in) during the session.
        sm_deps, data_deps = Karpov.ResolveDependencies(["calc_sessionTotalLocalesVisited"])
        results = run_and_measure(self.interface.CalculateSummaryMeasures, smoothed_data, sm_deps, data_deps)

        # Compare results
        assert results["calc_sessionTotalLocalesVisited"] == actual_summ_measures["KP_session_differentlocalesVisited_#"]

    @pytest.mark.parametrize("smoothed_data, actual_summ_measures", TEST_CASES)
    def test_sessionTotalStops(self, smoothed_data, actual_summ_measures):
        # Calculate total of stops in a session.
        sm_deps, data_deps = Karpov.ResolveDependencies(["calc_sessionTotalStops"])
        results = run_and_measure(self.interface.CalculateSummaryMeasures, smoothed_data, sm_deps, data_deps)

        # Compare results
        assert results["calc_sessionTotalStops"] == actual_summ_measures["KP_session_Stops_total#"]