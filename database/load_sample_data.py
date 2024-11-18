import os, dotenv, pathlib

import pandas as pd
import sqlalchemy

# Load database info
dotenv.load_dotenv()

db_user = os.getenv("DB_USER")
db_pass = os.getenv("DB_PASS")
db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")
db_name = os.getenv("DB_NAME")
db_table = "TimeSeries"
trials = ['Q405HT1001_02_0_0053_0015689_comb.csv',
          'Q405HT1001_04_0_0059_0015691_comb.csv',
          'Q405HT1001_10_0_0250_0015697_comb.csv',
          'Q405HT1002_06_2_0166_0015703_comb.csv',
          'Q405HT1003_01_0_0299_0015708_comb.csv']

db_engine = sqlalchemy.create_engine(f'mysql+mysqlconnector://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}')

for trial in trials:
    data_path = pathlib.Path("./data/" + trial)
    data = pd.read_csv(data_path)
    data.to_sql(db_table,db_engine, if_exists = "append", index = False)