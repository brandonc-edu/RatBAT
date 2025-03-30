import pytest
import numpy as np
import os
#from sklearn.metrics import accuracy_score, precision_score, recall_score,f1_score
#from testing.testing_helpers.ma_smoothing import moving_average
#from preprocessing.smoothing import lowess, repeated_running_medians
#from preprocessing.segmentation import segment_path
#from preprocessing.Preprocessor import Preprocessor
#from FRDRQuery.query import get_timeseries

def segmentation_test_set():
    t_ids = []
    for f in os.listdir("testing/test_data/"):
        # Get all trial ids.
        t_ids.append(f.split("_")[-2])
    print(t_ids)
    return t_ids
@pytest.fixture
def smoothing_test_set():
    pass

@pytest.fixture
def preprocessing_test_set():
    pass

segmentation_test_set()