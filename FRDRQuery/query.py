"""
Filename: query.py
Author(s): Daniel Locke
Created: 2025/01/18
Last Modified: 2025/03/05
Description: Various functions to manage access to the local database and the FRDR.
"""

import requests
import pandas as pd
import numpy as np
from django.db.models.base import ModelBase
from django.db.models import Q
from database.db_helper import build_model, get_relationship, FIELD_LOOKUPS, update_timeseries
from database.db_helper import build_model, get_relationship, FIELD_LOOKUPS, update_timeseries
from django_pandas.io import read_frame

def get_frdr_urls(filters:dict, trial_model:ModelBase, dtypes:str) -> list[(int,str,str)]:
    """Retreives requested data from local db/FRDR and optionally saves to local database.

    Parameters
    ----------
    filters : dict
        Feature/filter pairs.
    trial_model : django.db.models.ModelBase
        Django model class for the trial table.
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

def get_preprocessed_urls(trials:list[int], trial_model:ModelBase) -> list[(int,str,str)]:
    """Retreives urls for smoothed files from the frdr for given trial_ids.

    Parameters
    ----------
    trials : list[int]
    trial_model : django.db.models.ModelBase
        Django model class for the trial table.
    """

    ts_fields = ["trial_id",
                 "preprocessed",
                 "timeseries__x_s"]

    urls = []

    for trial in trials:
        data = (trial_model.objects.filter(trial_id = trial).values(*ts_fields).distinct())[0]
        
        if not data["preprocessed"] == None and data["timeseries__x_s"] == None:
            urls.append((data["trial_id"], "s", data["preprocessed"])) 
    
    return urls

def get_data(filters:dict, trial_model:ModelBase, fields:list[str]) -> list[dict]:
    """Given a list of filters and fields, get data all for those fields which falls under the filter.

    Parameters
    ----------
    filters : dict
        Feature/filter pairs.
    trial_model : django.db.models.ModelBase
        Django model class for the trial table.

    Returns
    -------
    list[dict]
    List of requested data entries organized by field.
    """
    query = Q()
    
    for f in filters:
        field  = f.get('field')
        lookup = f.get('lookup')
        value  = f.get('value')

        if not lookup in FIELD_LOOKUPS:
            raise ValueError(f"Invalid lookup type provided: {lookup}")
        
        field = get_relationship(trial_model,field)

        if field == None:
            raise ValueError(f"Could not find relationship between table {trial_model._meta.model_name} and field {f.get('field')}.")
        field = field.replace("trial__","")
        filter = {f"{field}__{lookup}":value}

        query = query & Q(**filter)
    try:
        fields_out = [get_relationship(trial_model, field).replace("trial__","") for field in fields]
    except Exception as e:
        raise ValueError(f"Could not find relationship between table {trial_model._meta.model_name} and field in {fields}.")

    query_out = trial_model.objects.filter(query).values(*fields_out).distinct()
    
    return list(query_out)
            

def frdr_request(files:list[tuple[int,str,str]], cache_path:str, timeseries_model:ModelBase) -> None:
    """Given a list of files accesses neccesary data from the frdr.

    Parameters
    ----------
    files : list(tuple(int,str,str))
        list of tuples of the format (trial_ID, dtype, url)
        dtypes:
             - "v" : raw video
             - "t" : raw time series data
             - "p" : raw pathplots
             - "s" : smoothed time series data
             - "s" : smoothed time series data
    cache_path : str
        filepath to location to cache requested data.
    timeseries_model : django.db.models.ModelBase
        Django model class for the timeseries table.

    Returns
    -------
    pandas.DataFrame
        Formatted requested trackfile.
    """
    failed_downloads = []
    failed_downloads = []

    for file in files:
      
        url = file[2].replace("g-624536.53220.5898.data.globus.org","www.frdr-dfdr.ca/repo/files")
        if file[1] in "vp":
            success = get_media(url,cache_path)
            if not success:
                failed_downloads.append((file[0], file[1]))
            success = get_media(url,cache_path)
            if not success:
                failed_downloads.append((file[0], file[1]))
        
        if file[1] == 't':
            ts_data = pd.DataFrame(columns=["trial_id","Sample_ID","T","X","Y","X_S","Y_S","V_S","MovementType_S"])
            trk = get_trackfile(file[0],url)
            if type(trk) == pd.DataFrame:
                ts_data = pd.concat([ts_data,trk],ignore_index=True)
                build_model(timeseries_model,ts_data)
            else:
                failed_downloads.append((file[0],'t'))
        if file[1] == 's':
            trk = get_preprocessed(file[0],url)
            if type(trk) == pd.DataFrame:
                update_timeseries(timeseries_model,trk)
            else:
                failed_downloads.append((file[0],'s'))
                
    return failed_downloads
            else:
                failed_downloads.append((file[0],'t'))
        if file[1] == 's':
            trk = get_preprocessed(file[0],url)
            if type(trk) == pd.DataFrame:
                update_timeseries(timeseries_model,trk)
            else:
                failed_downloads.append((file[0],'s'))
                
    return failed_downloads

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
        return False
        return False

    with open(cache_path + "/" + filename, "wb") as fh:
        for i in r.iter_content(chunk_size=10*1024*1024):
            fh.write(i)
    return True
    return True

def get_timeseries(trials:list[int], trial_model) -> pd.DataFrame:
    """Given a list of trial ids, get dataframes of time series data for those trials.

    Parameters
    ----------
    trials : list[int]
        List of trial ids for which the time series data will be accessed from the database.
    trial_model : django.db.models.ModelBase
        Django model class for the trial table.

    Returns
    -------
    dict[pandas.Dataframe]
    Dictionary of time series tables by trial id.
    """

    ts_tables = {}

    ts_fields = ["timeseries__sample_id",
                 "timeseries__t",
                 "timeseries__x",
                 "timeseries__y",
                 "timeseries__x_s",
                 "timeseries__y_s",
                 "timeseries__v_s",
                 "timeseries__movementtype_s"]
    
    for trial in trials:
        ts_data = trial_model.objects.filter(trial_id = trial).values(*ts_fields).distinct()
        ts_tables[trial] = read_frame(ts_data).rename((lambda x: x.replace("timeseries__","")),axis = "columns")
        ts_tables[trial] = read_frame(ts_data).rename((lambda x: x.replace("timeseries__","")),axis = "columns")
    return ts_tables

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
        names = ["Sample no.","Time","X","Y"]
        tf = pd.read_csv(url, names = names, usecols = range(4))
        header_idx = 0

        for i in range(len(tf)):
            if tf.loc[i,"Sample no."] == "Sample no.":
                header_idx = i + 1
                break
        tf = tf[header_idx:].reset_index(drop=True)
    
        names = ["Sample no.","Time","X","Y"]
        tf = pd.read_csv(url, names = names, usecols = range(4))
        header_idx = 0

        for i in range(len(tf)):
            if tf.loc[i,"Sample no."] == "Sample no.":
                header_idx = i + 1
                break
        tf = tf[header_idx:].reset_index(drop=True)
    
    except Exception as e:
        print(f"Error downloading file: {url}")
        print(f"Error details: {e}")
        return None

    tf.rename({"Sample no.":"sample_id","Trial_ID":"trial_id","X":"x","Y":"y","Time":"t"},axis=1,inplace=True)
    tf["trial_id"] = [trial_id for _ in range(len(tf.index))]
    tf = tf[["trial_id","sample_id","t","x","y"]]
    tf.replace("-",np.nan,inplace=True)

    return tf

def get_preprocessed(trial_id:int, url:str):
    """Fetches preprocessed trackfile from the FRDR and formats it to match the local database.

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
        names = ["sample_id","x_s","y_s","v_s","movementtype_s"]
        tf = pd.read_csv(url, names = names)
    
    except Exception as e:
        print(f"Error downloading file: {url}")
        print(f"Error details: {e}")
        return None

    tf["trial_id"] = [trial_id for _ in range(len(tf.index))]
    tf = tf[["trial_id","sample_id","x_s","y_s","v_s","movementtype_s"]]
    tf.replace("-",np.nan,inplace=True)

    return tf
def get_preprocessed(trial_id:int, url:str):
    """Fetches preprocessed trackfile from the FRDR and formats it to match the local database.

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
        names = ["sample_id","x_s","y_s","v_s","movementtype_s"]
        tf = pd.read_csv(url, names = names)
    
    except Exception as e:
        print(f"Error downloading file: {url}")
        print(f"Error details: {e}")
        return None

    tf["trial_id"] = [trial_id for _ in range(len(tf.index))]
    tf = tf[["trial_id","sample_id","x_s","y_s","v_s","movementtype_s"]]
    tf.replace("-",np.nan,inplace=True)

    return tf