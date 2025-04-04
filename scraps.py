import numpy as np
import pandas as pd
from preprocessing.Preprocessor import Preprocessor

# Initialize the Preprocessor with default parameters
prepro = Preprocessor()

# Load the CSV file
try:
    raw_data = pd.read_csv("./trial_32.csv")
except FileNotFoundError:
    print("Error: The specified CSV file was not found.")
    exit()

# Ensure the required columns are present
required_columns = {'sample_id', 'x', 'y'}
if not required_columns.issubset(raw_data.columns):
    print(f"Error: The file does not contain the required columns: {required_columns}")
    exit()

# Filter out rows with invalid or missing data in the required columns
raw_data = raw_data.dropna(subset=['sample_id', 'x', 'y'])

# Format the data as a NumPy array
formatted_data = raw_data[['sample_id', 'x', 'y']].to_numpy().astype(float)

print("Formatted Data (First 5 Rows):")
print(formatted_data[:5])

# Preprocess the data
try:
    preprocessed_data = prepro.preprocess_data(formatted_data)
    print("Preprocessed Data (First 5 Rows):")
    print(preprocessed_data[:5])
except Exception as e:
    print(f"Error during preprocessing: {e}")