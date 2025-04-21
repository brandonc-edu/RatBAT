import pathlib, re
import pandas as pd
import db_connector.models as models
from django.core.management.base import BaseCommand
from django.db import connection
from database.db_helper import build_model
import os
import sys

# Transforms a string of fall times to a list of fall times
# Each list is separated by numbers
def str_to_list(s):
    if s == None:
        return []
    
    l = re.split("\D",s)
    l_out = []
    for i in l:
        if len(i) >= 1:
            l_out.append(i)
    return l_out

class Command(BaseCommand):
    help = "Update urls to use publication ids given in 'FRDR_update_log.csv'"
    
    def handle(self,*args,**kwargs):
        # Runs with 'python3 backend/manage.py update_urls'
        
        

        # Load updates from csv file.
        updates_path = os.path.join(os.path.dirname(__file__),'..','..','..','..','database','data','FRDR_update_log.csv')
        updates_path = os.path.abspath(updates_path)
        updates = pd.read_csv(updates_path,dtype = {"Study_ID":str,"Publication_ID":str,"default_smoothed_available":int})
        updates.set_index('Study_ID',inplace=True)
        
        row_models = list(models.trial.objects.filter(experimentgroup__experiment__studygroup__study_id__in = updates.index))
        
        for i in range(len(row_models)):        
            study_id = list(models.studygroup.objects.filter(experiment__experimentgroup__trial__trial_id__exact = row_models[i].trial_id))[0].study_id
            row_models[i].pathplot = re.sub("publication_[0-9]+/",f"publication_{updates.loc[study_id,'Publication_ID']}/",str(row_models[i].pathplot))
            row_models[i].trackfile = re.sub("publication_[0-9]+/",f"publication_{updates.loc[study_id,'Publication_ID']}/",str(row_models[i].trackfile))
            row_models[i].video = re.sub("publication_[0-9]+/",f"publication_{updates.loc[study_id,'Publication_ID']}/",str(row_models[i].video))
            row_models[i].preprocessed = None if not updates.loc[study_id,"default_smoothed_available"] else (str(row_models[i].trackfile).replace("05_EthoVision_csvTrackFiles","08_SEEprocessedTrackFiles")).replace("_TrackFile","_smoothed") 
            sys.stdout.write('\r' + f"Updating urls: {int(100*i/len(row_models))}%")    

        sys.stdout.write("\rLoading changes into database...")
        models.trial.objects.bulk_update(row_models, ["pathplot","trackfile","video","preprocessed"], batch_size = 100)
        self.stdout.write("\r\033[32mSuccessfully updated urls.\033[0m".ljust(50))