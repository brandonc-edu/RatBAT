import requests
import pandas as pd
import numpy as np
from database.db_helper import build_model

def get_frdr_urls():
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
    cache : str
        filepath to location to cache requested data.
    save : bool
        If true the accessed time series data will be saved into the database. (defaults to True)
    """
    url1 = "https://g-624536.53220.5898.data.globus.org/11/published/publication_440/submitted_data/Q17/05_EthoVision_csvTrackFiles/Q17Clg3012_04_5_0042_0000062_TrackFile.csv"
    url2 = "https://g-624536.53220.5898.data.globus.org/11/published/publication_440/submitted_data/Q17/03_Videos_mpgFiles/Q17Clg3_of1_inj09_20011213_007_008_009_010_011_012.mpg"
    return [(62, "t", url1),(46, "v", url2)]

def frdr_request(files:list, cache_path:str, model, save:bool) -> None:
    """Given a list of files accesses neccesary data from the frdr.

    Parameters
    ----------
    files : list(tuple(int,str,str))
        list of tuples of the format (trial_ID, dtype, url)
        dtypes:
             - "v" : raw video
             - "t" : raw time series data
             - "p" : raw pathplots
    cache_path : str
        filepath to location to cache requested data.
    db_engine : sqlalchemy.Engine
        engine to connect with local database.
    save : bool
        If true the accessed time series data will be saved into the database.

    Returns
    -------
    pandas.DataFrame
        Formatted requested trackfile.
    """

    ts_data = pd.DataFrame(columns=["Trial_ID","Sample_ID","T","X","Y","X_S","Y_S","V_S","MovementType_S"])
    for file in files:
        url = file[2].replace("g-624536.53220.5898.data.globus.org","www.frdr-dfdr.ca/repo/files")
        
        get_media(url,cache_path)
        
        if save and file[1] == 't':
            ts_data = pd.concat([ts_data,get_trackfile(file[0],url)],ignore_index=True)
    
        
    if save:    
        build_model(model,ts_data)
    
    print("All FRDR files successfully cached")

def get_media(url:str,cache_path:str) -> None:
    """Fetches a file from the frdr and saves it in the cache location.

    Parameters
    ----------
    url : str
        url of the requested file on the frdr.
    cache_path : str
        filepath to the save location for caching data.        
    """
    filename = url.split("/")[-1]
    try:
        r = requests.get(url,stream=True)
        r.raise_for_status()
    except:
        print(f"Error downloading file: {url}")

    with open(cache_path + "/" + filename, "wb") as fh:
        for i in r.iter_content(chunk_size=1024*1024):
            fh.write(i)


def get_trackfile(trial_ID:int, url:str):
    """Fetches trackfile from the FRDR and formats it to match the local database.

    Parameters
    ----------
    trial_ID : int
        trial_ID of requested trial.
    url : str
        url of the requested trackfile on the frdr.
            
    Returns
    -------
    pandas.DataFrame
        Formatted requested trackfile.
    """
    try:
        tf = pd.read_csv(url, header = 31)
    except:
        print(f"Error downloading file: {url}")
    tf.rename({"Sample no.":"Sample_ID","Time":"T"},axis=1,inplace=True)
    tf.drop(["Area","ZONES"],axis=1,inplace=True)
    tf["Trial_ID"] = [trial_ID for _ in range(len(tf.index))]
    tf = tf[["Trial_ID","Sample_ID","T","X","Y"]]
    tf.replace("-",np.nan,inplace=True)
    return tf
"""
For testing purposes:


load_dotenv()
db_user = os.getenv("DB_USER")
db_pass = os.getenv("DB_PASS")
db_host = os.getenv("DB_HOST")
db_port = int(os.getenv("DB_PORT"))
db_name = os.getenv("DB_NAME")

db_engine = sqlalchemy.create_engine(f'mysql+mysqlconnector://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}')

url1 = "https://g-624536.53220.5898.data.globus.org/11/published/publication_440/submitted_data/Q17/05_EthoVision_csvTrackFiles/Q17Clg3012_04_5_0042_0000062_TrackFile.csv"
url2 = "https://g-624536.53220.5898.data.globus.org/11/published/publication_440/submitted_data/Q17/03_Videos_mpgFiles/Q17Clg3_of1_inj09_20011213_007_008_009_010_011_012.mpg"

frdr_request(files=[(62, "t", url1),(46, "v", url2)], cache_path="./database/data/test_data", db_engine=db_engine, save = True)
"""