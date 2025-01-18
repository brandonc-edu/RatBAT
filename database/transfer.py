import requests
import sqlalchemy
import pandas as pd
from dotenv import load_dotenv
import os


def query(filters:dict, dtypes, save:bool = True):
    """Retreives requested data from local db/FRDR and optionally saves to local database.

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
        If true the accessed time series data will be saved into the database. (defaults to True)
            
    Returns
    -------
    type
        the data requested
    """
    load_dotenv()
    db_user = os.getenv("DB_USER")
    db_pass = os.getenv("DB_PASS")
    db_host = os.getenv("DB_HOST")
    db_port = int(os.getenv("DB_PORT"))
    db_name = os.getenv("DB_NAME")

    db_engine = sqlalchemy.create_engine(f'mysql+mysqlconnector://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}')

    # Determine what data already exists in the database, compile list of data to access.

    # All files that need to be retrieved from the FRDR are added to a list (ID, type, url). 


def frdr_request(files:list,save:bool,db_engine):
    save_data = pd.DataFrame(columns=["Trial_ID","Sample_ID","T","X","Y","X_S","Y_S","V_S","MovementType_S"])
    for file in files:
        url = file[2].replace("g-624536.53220.5898.data.globus.org","www.frdr-dfdr.ca/repo/files")
        r = requests.get(url)
        # do whatever needs to be done for frontend transfering purposes.
        if save and file[1] == 0:
            save_data = pd.concat([save_data,format_trackfile(file[0],url)],ignore_index=True)
    if save:    
        save_data.to_sql(if_exists='append')


def format_trackfile(trial_ID,url):
    tf = pd.read_csv(url, header = 31)
    tf.rename({"Sample no.":"Sample_ID","Time":"T"},axis=1,inplace=True)
    tf.drop(["Area","ZONES"],axis=1,inplace=True)
    tf["Trial_ID"] = [trial_ID for _ in range(len(tf.index))]
    tf = tf[["Trial_ID","Sample_ID","T","X","Y"]]
    return tf

frdr_request([(62, 0,"https://g-624536.53220.5898.data.globus.org/11/published/publication_440/submitted_data/Q17/05_EthoVision_csvTrackFiles/Q17Clg3012_04_5_0042_0000062_TrackFile.csv")], True)