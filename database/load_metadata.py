import os, dotenv, pathlib, re

import pandas as pd
import sqlalchemy

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
# Load database info and create datasbase engine with sqlalchemy.
dotenv.load_dotenv()

db_user = os.getenv("DB_USER")
db_pass = os.getenv("DB_PASS")
db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")
db_name = os.getenv("DB_NAME")

db_engine = sqlalchemy.create_engine(f'mysql+mysqlconnector://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}')

# Load metadata from csv file.
data_path = pathlib.Path("./database/data/FRDR_interface_20211029_SupplementaryMaterial(MetaDataTable).csv")
df = pd.read_csv(data_path,header=1, encoding_errors="replace", dtype=str)

# Rename columns to match the database column names and drop columns that do not appear in the database.
label_path = pathlib.Path("./database/data/FRDR_variable_translations.csv")
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
                     "Trackfile/Pathplot/Video",
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

# Divide "Trackfile/Pathplot/Video" column into 3 boolean columns.
tables["Trial"]["Trackfile"] = [False for _ in tables["Trial"].index]
tables["Trial"]["Pathplot"]  = [False for _ in tables["Trial"].index]
tables["Trial"]["Video"]     = [False for _ in tables["Trial"].index]

available_ID_dict = {"1":(True,True,True),
                     "2":(True,True,False),
                     "3":(True,False,True),
                     "4":(False,True,True),
                     "5":(True,False,False),
                     "6":(False,False,True)}
for row in tables["Trial"].index:
    tables["Trial"].loc[row,"Trackfile"] = available_ID_dict[tables["Trial"].loc[row,"Trackfile/Pathplot/Video"]][0]
    tables["Trial"].loc[row,"Pathplot"]  = available_ID_dict[tables["Trial"].loc[row,"Trackfile/Pathplot/Video"]][1]
    tables["Trial"].loc[row,"Video"]     = available_ID_dict[tables["Trial"].loc[row,"Trackfile/Pathplot/Video"]][2]

tables["Trial"].drop("Trackfile/Pathplot/Video",axis=1,inplace=True)

# Reorder columns.
tables["Trial"] = tables["Trial"][["Trial_ID",
                     "DateAndTime",
                     "AnimalWeight",
                     "InjectionNumber",
                     "OFTestNumber",
                     "DrugRxNumber",
                     "Experimenter",
                     "Duration",
                     "FallsDuringTest",
                     "Notes",
                     "Trackfile",
                     "Pathplot",
                     "Video",
                     "Video_ID",
                     "EventType_ID",
                     "Animal_ID",
                     "Apparatus_ID",
                     "Treatment_ID"]]

publish_order = ["LightCycleColony",
                 "LightCycleTest",
                 "ArenaType",
                 "ArenaLoc",
                 "ArenaObjects",
                 "LightConditions",
                 "SurgeryManipulation",
                 "SurgeryOutcome",
                 "EventType",
                 "Animal",
                 "Apparatus",
                 "Treatment",
                 "Trial",
                 "Fall",
                 "Experiment",
                 "ExperimentGroup",
                 "Study",
                 "StudyGroup",
                 "Project",
                 "ProjectGroup"]

# Publish all tables to database.
for table in publish_order:
    tables[table].to_sql(table, db_engine, if_exists = "append", index = False)
