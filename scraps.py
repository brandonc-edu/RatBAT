import numpy as np
from preprocessing.Preprocessor import Preprocessor
import pandas as pd

# Default parameters for Preprocessor
prepro = Preprocessor()
raw_data = pd.read_csv("./Q405HT1001_04_0_0059_0015691_TrackFile.csv")
raw_data = raw_data[(raw_data["X"] != '-') | (raw_data["Y"] != '-')]
raw_data = raw_data.to_numpy().astype(float)
print(raw_data[:5])
preprocessed_data = prepro.preprocess_data(raw_data)
print(preprocessed_data[:5])