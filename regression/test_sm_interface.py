import pytest
import SummaryMeasures.CommanderSM as csm
import SummaryMeasures.DependenciesSM as dsm
from SummaryMeasures.DependenciesSM import Karpov
import SummaryMeasures.FieldSM as fsm
from regression.helpers import KARPOV_SM_TEST_CASES, KARPOV_DATA_TEST_CASES


class Test_SM_Interface:

    @pytest.mark.parametrize("sm, expected_summary_measures", KARPOV_SM_TEST_CASES)
    def test_sm_dependencies(self, sm, expected_summary_measures):
        resolved_summary_measures, _ = Karpov.ResolveDependencies([sm])

        assert set(resolved_summary_measures) == set(expected_summary_measures + [sm])

    @pytest.mark.parametrize("sm, expected_data_calcs", KARPOV_DATA_TEST_CASES)
    def test_data_dependencies(self, sm, expected_data_calcs):
        _, resolved_data_calcs = Karpov.ResolveDependencies([sm])

        assert set(resolved_data_calcs) == set(expected_data_calcs)
        
