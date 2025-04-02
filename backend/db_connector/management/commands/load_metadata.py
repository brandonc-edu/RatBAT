import pathlib, re
import pandas as pd
import db_connector.models as models
from django.core.management.base import BaseCommand
from django.db import connection
from database.db_helper import build_model
import os

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
    help = "Load all metadata into the database."
    
    def handle(self,*args,**kwargs):
        # Runs with 'python3 backend/manage.py load_metadata'
        
        # Load metadata from csv file.
        data_path = os.path.join(os.path.dirname(__file__),'..','..','..','..','database','data','FRDR_interface_20211029_SupplementaryMaterial(MetaDataTable).csv')
        data_path = os.path.abspath(data_path)
        df = pd.read_csv(data_path,header=1, encoding_errors="replace", dtype=str)

        # Load updates from csv file.
        updates_path = os.path.join(os.path.dirname(__file__),'..','..','..','..','database','data','FRDR_update_log.csv')
        updates_path = os.path.abspath(updates_path)
        updates = pd.read_csv(updates_path,dtype = {"Study_ID":str,"Publication_ID":str,"default_smoothed_available":int})
        updates.set_index('Study_ID',inplace=True)

        # Rename columns to match the database column names and drop columns that do not appear in the database.
        label_path = os.path.join(os.path.dirname(__file__),'..','..','..','..','database','data','FRDR_variable_translations.csv')
        label_path = os.path.abspath(label_path)
        labels = pd.read_csv(label_path)
        drop_labels = []
        labels = labels.set_index("Original Label")["New Label"]
        df.rename(labels, axis=1, inplace=True)
        for i in labels.values:
            if i.startswith("DROP"):
                drop_labels.append(i)
        df.drop(labels=drop_labels + ["Unnamed: 0"], axis=1, inplace=True)

        # Drop 'total' row from df.
        df = df[:-1]

        # Update file links to frdr links instead of globus links.
        df[["Video","Trackfile","Pathplot"]] = df[["Video","Trackfile","Pathplot"]].map(lambda url: str(url).replace("g-624536.53220.5898.data.globus.org","www.frdr-dfdr.ca/repo/files"))
        for column in ["Video","Trackfile","Pathplot"]:
            df[column] = df.apply(lambda row: re.sub("publication_[0-9]+/",f"publication_{updates.loc[row['Study_ID'],'Publication_ID']}/",str(row[column])),axis=1)

        # Adding preprocessed url if exists.
        df["preprocessed"] = df.apply(lambda row: None if not updates.loc[row["Study_ID"],"default_smoothed_available"] else (row["Trackfile"].replace("05_EthoVision_csvTrackFiles","08_SEEprocessedTrackFiles")).replace("_TrackFile","_smoothed"), axis=1)

        # Add integer ID values for unique apparatus/treatment combinations.
        # Create new dataframes with integer IDs then merge them back into the original dataframe.
        apparatus_IDs = df.groupby(["ArenaType_ID","ArenaLoc_ID","ArenaObjects_ID","LightConditions_ID"]).first()
        apparatus_IDs["Apparatus_ID"] = [i for i in range(apparatus_IDs.index.size)]
        apparatus_IDs = apparatus_IDs[["Apparatus_ID"]].reset_index()

        treatment_IDs = df.groupby(["SurgeryManipulation_ID",
                            "SurgeryOutcome_ID",
                            "DrugRx_Drug1",
                            "DrugRx_Dose1",
                            "DrugRx_Drug2",
                            "DrugRx_Dose2",
                            "DrugRx_Drug3",
                            "DrugRx_Dose3"],dropna=False).first()
        treatment_IDs["Treatment_ID"] = [i for i in range(treatment_IDs.index.size)]
        treatment_IDs = treatment_IDs[["Treatment_ID"]].reset_index()

        df = df.merge(apparatus_IDs,'left',["ArenaType_ID","ArenaLoc_ID","ArenaObjects_ID","LightConditions_ID"])
        df = df.merge(treatment_IDs,'left',["SurgeryManipulation_ID","SurgeryOutcome_ID","DrugRx_Drug1","DrugRx_Dose1","DrugRx_Drug2","DrugRx_Dose2","DrugRx_Drug3","DrugRx_Dose3"])

        # Falls during test column is missing values, convert NAN to 0
        df["FallsDuringTest"] = df["FallsDuringTest"].fillna(0)

        # Split into individual dataframes for each table in the database.
        tables = dict()
        tables["Project"] = df.groupby("Project_ID").first().reset_index()[["Project_ID","ProjectDesc"]]
        tables["Study"] = df.groupby("Study_ID").first().reset_index()[["Study_ID","StudyDesc"]]
        tables["Experiment"] = df.groupby("Experiment_ID").first().reset_index()[["Experiment_ID","ExperimentDesc"]]

        tables["ProjectGroup"] = df.groupby(["Project_ID","Study_ID"]).first().reset_index()[["Project_ID","Study_ID"]]
        tables["StudyGroup"] = df.groupby(["Study_ID","Experiment_ID"]).first().reset_index()[["Study_ID","Experiment_ID"]]
        tables["ExperimentGroup"] = df.groupby(["Experiment_ID","Trial_ID"]).first().reset_index()[["Experiment_ID","Trial_ID"]]

        tables["Trial"] = df.groupby("Trial_ID").first().reset_index()[
                            ["Trial_ID",
                            "DateAndTime",
                            "AnimalWeight",
                            "InjectionNumber",
                            "OFTestNumber",
                            "DrugRxNumber",
                            "Experimenter",
                            "Duration",
                            "FallsDuringTest",
                            "Notes",
                            "preprocessed",
                            "Trackfile",
                            "Pathplot",
                            "Video",
                            "Video_ID",
                            "EventType_ID",
                            "Animal_ID",
                            "Apparatus_ID",
                            "Treatment_ID"]]
        tables["Animal"] = df.groupby("Animal_ID").first().reset_index()[
                            ["Animal_ID",
                            "LightCycleColony_ID",
                            "LightCycleTest_ID"]]
        tables["Apparatus"] = df.groupby("Apparatus_ID").first().reset_index()[
                            ["Apparatus_ID",
                            "ArenaType_ID",
                            "ArenaLoc_ID",
                            "ArenaObjects_ID",
                            "LightConditions_ID"]]
        tables["Treatment"] = df.groupby("Treatment_ID").first().reset_index()[
                            ["Treatment_ID",
                            "SurgeryManipulation_ID",
                            "SurgeryOutcome_ID",
                            "DrugRx_Drug1",
                            "DrugRx_Dose1",
                            "DrugRx_Drug2",
                            "DrugRx_Dose2",
                            "DrugRx_Drug3",
                            "DrugRx_Dose3"
                            ]]
        tables["LightCycleColony"] = df.groupby("LightCycleColony_ID").first().reset_index()[["LightCycleColony_ID","LightCycleColonyDesc"]]
        tables["LightCycleTest"] = df.groupby("LightCycleTest_ID").first().reset_index()[["LightCycleTest_ID","LightCycleTestDesc"]]
        tables["ArenaType"] = df.groupby("ArenaType_ID").first().reset_index()[["ArenaType_ID","ArenaTypeDesc"]]
        tables["ArenaLoc"] = df.groupby("ArenaLoc_ID").first().reset_index()[["ArenaLoc_ID","ArenaLocDesc"]]
        tables["ArenaObjects"] = df.groupby("ArenaObjects_ID").first().reset_index()[["ArenaObjects_ID","ArenaObjectsDesc"]]
        tables["LightConditions"] = df.groupby("LightConditions_ID").first().reset_index()[["LightConditions_ID","LightConditionsDesc"]]
        tables["SurgeryManipulation"] = df.groupby("SurgeryManipulation_ID").first().reset_index()[["SurgeryManipulation_ID","SurgeryManipulationDesc"]]
        tables["SurgeryOutcome"] = df.groupby("SurgeryOutcome_ID").first().reset_index()[["SurgeryOutcome_ID","SurgeryOutcomeDesc"]]

        tables["EventType"] = df.groupby("EventType_ID").first().reset_index()[["EventType_ID","EventTypeDesc"]]
        tables["Fall"] = df.groupby("Trial_ID").first().reset_index()[["Trial_ID","TimeWhenFell"]]

        # Split each fall in a trial into its own line.
        tables["Fall"].loc[:,"TimeWhenFell"] = tables["Fall"].loc[:,"TimeWhenFell"].map(str_to_list)
        tables["Fall"] = tables["Fall"].explode("TimeWhenFell",ignore_index=True).dropna().drop_duplicates().reset_index(drop=True)

        publish_order = [(models.lightcyclecolony,"LightCycleColony"),
                        (models.lightcycletest,"LightCycleTest"),
                        (models.arenatype,"ArenaType"),
                        (models.arenaloc,"ArenaLoc"),
                        (models.arenaobjects,"ArenaObjects"),
                        (models.lightconditions,"LightConditions"),
                        (models.surgerymanipulation,"SurgeryManipulation"),
                        (models.surgeryoutcome,"SurgeryOutcome"),
                        (models.eventtype,"EventType"),
                        (models.animal,"Animal"),
                        (models.apparatus,"Apparatus"),
                        (models.treatment,"Treatment"),
                        (models.trial,"Trial"),
                        (models.fall,"Fall"),
                        (models.experiment,"Experiment"),
                        (models.experimentgroup,"ExperimentGroup"),
                        (models.study,"Study"),
                        (models.studygroup,"StudyGroup"),
                        (models.project,"Project"),
                        (models.projectgroup,"ProjectGroup")]


        # Publish all tables to database.
        for table in publish_order:
            self.stdout.write(f"loading table '{table[1]}' into the database...")
            build_model(table[0],tables[table[1]],replace = True)
         

        self.stdout.write("\033[32mSuccessfully loaded metadata into database.\033[0m")