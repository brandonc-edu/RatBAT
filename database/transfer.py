import requests
import pymysql
import os, dotenv

def frdr_query(filters:dict, dtypes, save:bool = True):
    """Retreives requested data from FRDR and optionally saves to local database.

    Parameters
    ----------
    filters : dict
        Feature/filter pairs.
    dtypes : str
        Desired data types
             - "a" : all
             - "v" : raw video
             - "t" : raw time series data
             - "p" : raw pathplots
            Any combination also works
    save : bool
        If true the queried data will be saved into the database. (defaults to True)
            
    Returns
    -------
    type
        the data requested
    """
    dotenv.load_dotenv()
    db_user = os.getenv("DB_USER")
    db_pass = os.getenv("DB_PASS")
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT")
    db_name = os.getenv("DB_NAME")

    db_con = pymysql.connect(
        host     = db_host,
        user     = db_user,
        password = db_pass,
        database = db_name,
        port     = db_port
    )

    cursor = db_con.cursor()

    

