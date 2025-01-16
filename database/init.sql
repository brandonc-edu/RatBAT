CREATE TABLE IF NOT EXISTS LightCycleColony (
    LightCycleColony_ID  INT          NOT NULL,
    LightCycleColonyDesc VARCHAR(200) NOT NULL,
    PRIMARY KEY (LightCycleColony_ID)
);

CREATE TABLE IF NOT EXISTS LightCycleTest (
    LightCycleTest_ID  INT          NOT NULL,
    LightCycleTestDesc VARCHAR(200) NOT NULL,
    PRIMARY KEY (LightCycleTest_ID)
);

CREATE TABLE IF NOT EXISTS ArenaType (
    ArenaType_ID  INT          NOT NULL,
    ArenaTypeDesc VARCHAR(200) NOT NULL,
    PRIMARY KEY (ArenaType_ID)
);

CREATE TABLE IF NOT EXISTS ArenaLoc (
    ArenaLoc_ID  INT          NOT NULL,
    ArenaLocDesc VARCHAR(200) NOT NULL,
    PRIMARY KEY (ArenaLoc_ID)
);

CREATE TABLE IF NOT EXISTS ArenaObjects (
    ArenaObjects_ID  INT          NOT NULL,
    ArenaObjectsDesc VARCHAR(200) NOT NULL,
    PRIMARY KEY (ArenaObjects_ID)
);

CREATE TABLE IF NOT EXISTS LightConditions (
    LightConditions_ID  INT          NOT NULL,
    LightConditionsDesc VARCHAR(200) NOT NULL,
    PRIMARY KEY (LightConditions_ID)
);

CREATE TABLE IF NOT EXISTS SurgeryManipulation (
    SurgeryManipulation_ID  INT          NOT NULL,
    SurgeryManipulationDesc VARCHAR(200) NOT NULL,
    PRIMARY KEY (SurgeryManipulation_ID)
);

CREATE TABLE IF NOT EXISTS SurgeryOutcome (
    SurgeryOutcome_ID  INT          NOT NULL,
    SurgeryOutcomeDesc VARCHAR(200) NOT NULL,
    PRIMARY KEY (SurgeryOutcome_ID)
);

CREATE TABLE IF NOT EXISTS EventType (
    EventType_ID  INT          NOT NULL,
    EventTypeDesc VARCHAR(200) NOT NULL,
    PRIMARY KEY (EventType_ID)
);

CREATE TABLE IF NOT EXISTS Animal (
    Animal_ID           CHAR(10) NOT NULL,
    LightCycleColony_ID INT      NOT NULL,
    LightCycleTest_ID   INT      NOT NULL,
    PRIMARY KEY (Animal_ID),
    FOREIGN KEY (LightCycleColony_ID) REFERENCES LightCycleColony(LightCycleColony_ID),
    FOREIGN KEY (LightCycleTest_ID)   REFERENCES LightCycleTest(LightCycleTest_ID)
);

CREATE TABLE IF NOT EXISTS Apparatus (
    Apparatus_ID       INT NOT NULL,
    ArenaType_ID       INT NOT NULL,
    ArenaLoc_ID        INT NOT NULL,
    ArenaObjects_ID    INT NOT NULL,
    LightConditions_ID INT NOT NULL,
    PRIMARY KEY (Apparatus_ID),
    FOREIGN KEY (ArenaType_ID)       REFERENCES ArenaType(ArenaType_ID),
    FOREIGN KEY (ArenaLoc_ID)        REFERENCES ArenaLoc(ArenaLoc_ID),
    FOREIGN KEY (ArenaObjects_ID)    REFERENCES ArenaObjects(ArenaObjects_ID),
    FOREIGN KEY (LightConditions_ID) REFERENCES LightConditions(LightConditions_ID)
);

CREATE TABLE IF NOT EXISTS Treatment (
    Treatment_ID           INT           NOT NULL,
    SurgeryManipulation_ID INT           NOT NULL,
    SurgeryOutcome_ID      INT           NOT NULL,
    DrugRx_Drug1           VARCHAR(20)   ,
    DrugRx_Dose1           VARCHAR(100)  ,
    DrugRx_Drug2           VARCHAR(20)   ,
    DrugRx_Dose2           VARCHAR(100)  ,
    DrugRx_Drug3           VARCHAR(20)   ,
    DrugRx_Dose3           VARCHAR(100)  ,
    PRIMARY KEY (Treatment_ID),
    FOREIGN KEY (SurgeryManipulation_ID) REFERENCES SurgeryManipulation(SurgeryManipulation_ID),
    FOREIGN KEY (SurgeryOutcome_ID)      REFERENCES SurgeryOutcome(SurgeryOutcome_ID)
);

CREATE TABLE IF NOT EXISTS Trial (
    Trial_ID        INT          NOT NULL,
    DateAndTime     VARCHAR(100) NOT NULL,
    AnimalWeight    INT          ,
    InjectionNumber INT          NOT NULL,
    OFTestNumber    INT          ,
    DrugRxNumber    INT          NOT NULL,
    Experimenter    VARCHAR(100) NOT NULL,
    Duration        INT          NOT NULL,
    FallsDuringTest INT          NOT NULL,
    Notes           VARCHAR(2000),
    Trackfile       VARCHAR(200) ,
    Pathplot        VARCHAR(200) ,
    Video           VARCHAR(200) ,
    Video_ID        VARCHAR(100),
    EventType_ID    INT          NOT NULL,
    Animal_ID       VARCHAR(100) NOT NULL,
    Apparatus_ID    INT          NOT NULL,
    Treatment_ID    INT          NOT NULL,
    PRIMARY KEY (Trial_ID),
    FOREIGN KEY (EventType_ID) REFERENCES EventType(EventType_ID),
    FOREIGN KEY (Animal_ID)    REFERENCES Animal(Animal_ID),
    FOREIGN KEY (Apparatus_ID) REFERENCES Apparatus(Apparatus_ID),
    FOREIGN KEY (Treatment_ID) REFERENCES Treatment(Treatment_ID)
);

CREATE TABLE IF NOT EXISTS Fall (
    Trial_ID     INT NOT NULL,
    TimeWhenFell INT NOT NULL,
    PRIMARY KEY (Trial_ID, TimeWhenFell),
    FOREIGN KEY (Trial_ID) REFERENCES Trial(Trial_ID)
);

CREATE TABLE IF NOT EXISTS Experiment (
    Experiment_ID  VARCHAR(100) NOT NULL,
    ExperimentDesc VARCHAR(200) NOT NULL,
    PRIMARY KEY (Experiment_ID)
);

CREATE TABLE IF NOT EXISTS ExperimentGroup (
    Experiment_ID VARCHAR(100) NOT NULL,
    Trial_ID      INT NOT NULL,
    PRIMARY KEY (Experiment_ID, Trial_ID),
    FOREIGN KEY (Experiment_ID) REFERENCES Experiment(Experiment_ID),
    FOREIGN KEY (Trial_ID) REFERENCES Trial(Trial_ID)
);

CREATE TABLE IF NOT EXISTS Study (
    Study_ID  CHAR(3)      NOT NULL,
    StudyDesc VARCHAR(200) NOT NULL,
    PRIMARY KEY (Study_ID)
);

CREATE TABLE IF NOT EXISTS StudyGroup (
    Study_ID      CHAR(3)          NOT NULL,
    Experiment_ID VARCHAR(100)     NOT NULL,
    PRIMARY KEY (Study_ID, Experiment_ID),
    FOREIGN KEY (Study_ID)   REFERENCES Study(Study_ID),
    FOREIGN KEY (Experiment_ID) REFERENCES Experiment(Experiment_ID)
);

CREATE TABLE IF NOT EXISTS Project (
    Project_ID  INT          NOT NULL,
    ProjectDesc VARCHAR(200) NOT NULL,
    PRIMARY KEY (Project_ID)
);

CREATE TABLE IF NOT EXISTS ProjectGroup (
    Project_ID  INT     NOT NULL,
    Study_ID    CHAR(3) NOT NULL,
    PRIMARY KEY (Project_ID, Study_ID),
    FOREIGN KEY (Project_ID) REFERENCES Project(Project_ID),
    FOREIGN KEY (Study_ID)   REFERENCES Study(Study_ID)
);

CREATE TABLE IF NOT EXISTS TimeSeries (
    Trial_ID       INT NOT NULL,
    Sample_ID      INT NOT NULL,
    T              DECIMAL(10,2) NOT NULL,
    X              DECIMAL(10,2),
    Y              DECIMAL(10,2),
    X_S            DECIMAL(10,2),
    Y_S            DECIMAL(10,2),
    V_S            DECIMAL(10,2),
    MovementType_S INT,
    PRIMARY KEY (Trial_ID, Sample_ID),
    FOREIGN KEY (Trial_ID) REFERENCES Trial(Trial_ID)
);