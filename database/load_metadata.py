import os, dotenv, pathlib

import pandas as pd
import pymysql

# Load database info
dotenv.load_dotenv()

db_user = os.getenv("DB_USER")
db_pass = os.getenv("DB_PASS")
db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")
db_name = os.getenv("DB_NAME")

# Load data from csv
data_path  = pathlib.Path("./FRDR_interface_20211029_SupplementaryMaterial(MetaDataTable).csv")

metadata = pd.read_csv(data_path)

