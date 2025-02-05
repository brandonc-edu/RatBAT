import requests
import pandas as pd
import numpy as np
from django.db.models import Q
from database.db_helper import build_model, get_relationship, FIELD_LOOKUPS
from django_pandas.io import read_frame

def get_frdr_urls(filters,trial_model,dtypes:str) -> list[(int,str,str)]:
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
    """

    query = Q()
    
    for f in filters:
        field  = f.get('field')
        lookup = f.get('lookup')
        value  = f.get('value')

        if not lookup in FIELD_LOOKUPS:
            raise ValueError(f"Invalid lookup type provided: {lookup}")
        
        field = get_relationship(trial_model,field)
        
        get_relationship(trial_model,field)        
        if field == None:
            raise ValueError(f"Could not find relationship between table {trial_model._meta.model_name} and field {f.get('field')}.")
        field = field.replace("trial__","")
        filter = {f"{field}__{lookup}":value}

        query = query & Q(**filter)
    
    query_out = trial_model.objects.filter(query)
    query_trk = query & Q(timeseries__isnull = True)
    query_trk_out = trial_model.objects.filter(query_trk)

    urls = []

    if dtypes == 'a':
        dtypes = 'vtp'
    if 'v' in dtypes:
        urls = urls + [(trial.trial_id,'v',trial.video) for trial in query_out if not trial.video == None]
    if 't' in dtypes:
        urls = urls + [(trial.trial_id,'t',trial.trackfile) for trial in query_trk_out if not trial.trackfile == None]
    if 'p' in dtypes:
        urls = urls + [(trial.trial_id,'p',trial.pathplot) for trial in query_out if not trial.pathplot == None]
    
    return urls

def get_local_trials(filters,trial_model,dtypes:str) -> list[(int,str)]:
    if dtypes == 'a':
        dtypes = 'vtp'
    if not 't' in dtypes:
        return []
    
    query = Q(timeseries__isnull = False)
    
    for f in filters:
        field  = f.get('field')
        lookup = f.get('lookup')
        value  = f.get('value')

        if not lookup in FIELD_LOOKUPS:
            raise ValueError(f"Invalid lookup type provided: {lookup}")
        
        field = get_relationship(trial_model,field)
        
        get_relationship(trial_model,field)        
        if field == None:
            raise ValueError(f"Could not find relationship between table {trial_model._meta.model_name} and field {f.get('field')}.")
        field = field.replace("trial__","")
        filter = {f"{field}__{lookup}":value}

        query = query & Q(**filter)

    query_out = trial_model.objects.filter(query).only("trial_id","trackfile").distinct()
    
    return [(trial.trial_id, trial.trackfile.split("/")[-1]) for trial in query_out if not trial.trackfile == None]

def frdr_request(files:list[tuple[int,str,str]], cache_path:str, model, save:bool) -> None:
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

    ts_data = pd.DataFrame(columns=["trial_id","Sample_ID","T","X","Y","X_S","Y_S","V_S","MovementType_S"])
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
        for i in r.iter_content(chunk_size=10*1024*1024):
            fh.write(i)

def db_request(trials:list[int,str], cache_path:str, model) -> None:
    for trial in trials:
        requested_qs = model.objects.filter(trial__exact = trial[0])
        requested_df = read_frame(requested_qs)[["sample_id","x","y","t"]]
        requested_df.to_csv(cache_path + "/" + trial[1],index=False)

def get_trackfile(trial_id:int, url:str):
    """Fetches trackfile from the FRDR and formats it to match the local database.

    Parameters
    ----------
    trial_id : int
        trial id of requested trial.
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

    tf.rename({"Sample no.":"sample_id","Trial_ID":"trial_id","X":"x","Y":"y","Time":"t"},axis=1,inplace=True)
    tf.drop(["Area","ZONES"],axis=1,inplace=True)
    tf["trial_id"] = [trial_id for _ in range(len(tf.index))]
    tf = tf[["trial_id","sample_id","t","x","y"]]
    tf.replace("-",np.nan,inplace=True)

    return tf
