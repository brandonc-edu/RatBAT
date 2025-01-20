from django.db import models

class LightCycleColony(models.Model):
    LightCycleColony_ID = models.IntegerField(primary_key=True)          
    LightCycleColonyDesc = models.CharField(max_length=200) 

class LightCycleTest(models.Model):
    LightCycleTest_ID = models.IntegerField(primary_key=True)          
    LightCycleTestDesc = models.CharField(max_length=200) 

class ArenaType(models.Model):
    ArenaType_ID = models.IntegerField(primary_key=True)          
    ArenaTypeDesc = models.CharField(max_length=200) 

class ArenaLoc(models.Model):
    ArenaLoc_ID = models.IntegerField(primary_key=True)          
    ArenaLocDesc = models.CharField(max_length=200) 

class ArenaObjects(models.Model):
    ArenaObjects_ID = models.IntegerField(primary_key=True)          
    ArenaObjectsDesc = models.CharField(max_length=200) 

class LightConditions(models.Model):
    LightConditions_ID = models.IntegerField(primary_key=True)          
    LightConditionsDesc = models.CharField(max_length=200) 

class SurgeryManipulation(models.Model):
    SurgeryManipulation_ID = models.IntegerField(primary_key=True)          
    SurgeryManipulationDesc = models.CharField(max_length=200) 

class SurgeryOutcome(models.Model):
    SurgeryOutcome_ID = models.IntegerField(primary_key=True)          
    SurgeryOutcomeDesc = models.CharField(max_length=200) 

class EventType(models.Model):
    EventType_ID = models.IntegerField(primary_key=True)          
    EventTypeDesc = models.CharField(max_length=200) 

class Animal(models.Model):
    Animal_ID = models.CharField(primary_key=True,max_length=10) 
    LightCycleColony_ID = models.ForeignKey(LightCycleColony, on_delete=models.CASCADE, db_column='LightCycleColony_ID')
    LightCycleTest_ID = models.ForeignKey(LightCycleTest, on_delete=models.CASCADE, db_column='LightCycleTest_ID')

class Apparatus(models.Model):
    Apparatus_ID = models.IntegerField(primary_key=True) 
    ArenaType_ID = models.ForeignKey(ArenaType, on_delete=models.CASCADE, db_column='ArenaType_ID')
    ArenaLoc_ID = models.ForeignKey(ArenaLoc, on_delete=models.CASCADE, db_column='ArenaLoc_ID')
    ArenaObjects_ID = models.ForeignKey(ArenaObjects, on_delete=models.CASCADE, db_column='ArenaObjects_ID')
    LightConditions_ID = models.ForeignKey(LightConditions, on_delete=models.CASCADE, db_column='LightConditions_ID')

class Treatment(models.Model):
    Treatment_ID = models.IntegerField(primary_key=True)           
    SurgeryManipulation_ID = models.ForeignKey(SurgeryManipulation, on_delete=models.CASCADE, db_column='SurgeryManipulation_ID')
    SurgeryOutcome_ID = models.ForeignKey(SurgeryOutcome, on_delete=models.CASCADE, db_column='SurgeryOutcome_ID')        
    DrugRx_Drug1 = models.CharField(max_length=20)   
    DrugRx_Dose1 = models.CharField(max_length=100)  
    DrugRx_Drug2 = models.CharField(max_length=20)   
    DrugRx_Dose2 = models.CharField(max_length=100)  
    DrugRx_Drug3 = models.CharField(max_length=20)   
    DrugRx_Dose3 = models.CharField(max_length=100)  

class Trial(models.Model):
    Trial_ID = models.IntegerField(primary_key=True)          
    DateAndTime = models.CharField(max_length=100) 
    AnimalWeight = models.IntegerField()          
    InjectionNumber = models.IntegerField()          
    OFTestNumber = models.IntegerField()          
    DrugRxNumber = models.IntegerField()          
    Experimenter = models.CharField(max_length=100) 
    Duration = models.IntegerField()          
    FallsDuringTest = models.IntegerField()          
    Notes = models.CharField(max_length=2000)
    Trackfile = models.CharField(max_length=200) 
    Pathplot = models.CharField(max_length=200) 
    Video = models.CharField(max_length=200) 
    Video_ID = models.CharField(max_length=100)
    EventType_ID = models.ForeignKey(EventType, on_delete=models.CASCADE, db_column='EventType_ID')
    Animal_ID = models.ForeignKey(Animal, on_delete=models.CASCADE, db_column='Animal_ID')
    Apparatus_ID = models.ForeignKey(Apparatus, on_delete=models.CASCADE, db_column='Apparatus_ID')
    Treatment_ID = models.ForeignKey(Treatment, on_delete=models.CASCADE, db_column='Treatment_ID')        


class Fall(models.Model):
    Trial_ID = models.ForeignKey(Trial, on_delete=models.CASCADE, db_column='Trial_ID')
    Trial_ID = models.IntegerField() 
    TimeWhenFell = models.IntegerField() 

class Experiment(models.Model):
    Experiment_ID = models.CharField(primary_key=True,max_length=100) 
    ExperimentDesc = models.CharField(max_length=200) 

class ExperimentGroup(models.Model):
    ID = models.AutoField(primary_key=True)
    Experiment_ID = models.ForeignKey(Experiment, on_delete=models.CASCADE, db_column='Experiment_ID')
    Trial_ID = models.ForeignKey(Trial, on_delete=models.CASCADE, db_column='Trial_ID')

class Study(models.Model):
    Study_ID = models.CharField(primary_key=True,max_length=3)      
    StudyDesc = models.CharField(max_length=200)     

class StudyGroup(models.Model):
    ID = models.AutoField(primary_key=True)
    Study_ID = models.ForeignKey(Study, on_delete=models.CASCADE, db_column='Study_ID')
    Experiment_ID = models.ForeignKey(Experiment, on_delete=models.CASCADE, db_column='Experiment_ID')

class Project(models.Model):
    Project_ID = models.IntegerField(primary_key=True)          
    ProjectDesc = models.CharField(max_length=200) 

class ProjectGroup(models.Model):
    ID = models.AutoField(primary_key=True)
    Project_ID = models.ForeignKey(Project, on_delete=models.CASCADE, db_column='Project_ID')
    Study_ID = models.ForeignKey(Study, on_delete=models.CASCADE, db_column='Study_ID')

class TimeSeries(models.Model):
    ID = models.AutoField(primary_key=True)
    Trial_ID = models.ForeignKey(Trial, on_delete=models.CASCADE, db_column='Trial_ID')
    Sample_ID = models.IntegerField() 
    T = models.DecimalField(max_digits=10, decimal_places=2)
    X = models.DecimalField(max_digits=10, decimal_places=2)
    Y = models.DecimalField(max_digits=10, decimal_places=2)
    X_S = models.DecimalField(max_digits=10, decimal_places=2)
    Y_S = models.DecimalField(max_digits=10, decimal_places=2)
    V_S = models.DecimalField(max_digits=10, decimal_places=2)
    MovementType_S = models.IntegerField()
