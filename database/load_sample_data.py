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

db_engine = sqlalchemy.create_engine(f'mysql+mysqlconnector://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}')


data_path = pathlib.Path(" FRDR_interface_20211029_SupplementaryMaterial(MetaDataTable).csv")
data = pd.read_csv(data_path)
print(data.head(10))
#data.to_sql(db_table,db_engine, if_exists = "append", index = False)