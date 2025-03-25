import os
import time

# Directory where preprocessed files are stored
directory = os.path.join(os.path.dirname(__file__), 'preprocessing', 'preprocessed')

# Time threshold (e.g., 24 hours in seconds)
time_threshold = 10

# Current time
now = time.time()

# Iterate through files in the directory
for filename in os.listdir(directory):
    file_path = os.path.join(directory, filename)
    if os.path.isfile(file_path):
        # Check if the file is older than the threshold
        if now - os.path.getmtime(file_path) > time_threshold:
            print(f"Deleting old file: {file_path}")
            os.remove(file_path)