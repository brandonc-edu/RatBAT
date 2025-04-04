from django.db import models

class lightcyclecolony(models.Model):
    lightcyclecolony_id = models.IntegerField(primary_key=True)          
    lightcyclecolonydesc = models.CharField(max_length=200) 

class lightcycletest(models.Model):
    lightcycletest_id = models.IntegerField(primary_key=True)          
    lightcycletestdesc = models.CharField(max_length=200,null=True) 

class arenatype(models.Model):
    arenatype_id = models.IntegerField(primary_key=True)          
    arenatypedesc = models.CharField(max_length=200) 

class arenaloc(models.Model):
    arenaloc_id = models.IntegerField(primary_key=True)          
    arenalocdesc = models.CharField(max_length=200) 

class arenaobjects(models.Model):
    arenaobjects_id = models.IntegerField(primary_key=True)          
    arenaobjectsdesc = models.CharField(max_length=200) 

class lightconditions(models.Model):
    lightconditions_id = models.IntegerField(primary_key=True)          
    lightconditionsdesc = models.CharField(max_length=200) 

class surgerymanipulation(models.Model):
    surgerymanipulation_id = models.IntegerField(primary_key=True)          
    surgerymanipulationdesc = models.CharField(max_length=200) 

class surgeryoutcome(models.Model):
    surgeryoutcome_id = models.IntegerField(primary_key=True)          
    surgeryoutcomedesc = models.CharField(max_length=200) 

class eventtype(models.Model):
    eventtype_id = models.IntegerField(primary_key=True)          
    eventtypedesc = models.CharField(max_length=200) 

class animal(models.Model):
    animal_id = models.CharField(primary_key=True,max_length=10) 
    lightcyclecolony = models.ForeignKey(lightcyclecolony, on_delete=models.CASCADE, db_column='lightcyclecolony_id')
    lightcycletest = models.ForeignKey(lightcycletest, on_delete=models.CASCADE, db_column='lightcycletest_id')

class apparatus(models.Model):
    apparatus_id = models.IntegerField(primary_key=True) 
    arenatype = models.ForeignKey(arenatype, on_delete=models.CASCADE, db_column='arenatype_id')
    arenaloc = models.ForeignKey(arenaloc, on_delete=models.CASCADE, db_column='arenaloc_id')
    arenaobjects = models.ForeignKey(arenaobjects, on_delete=models.CASCADE, db_column='arenaobjects_id')
    lightconditions = models.ForeignKey(lightconditions, on_delete=models.CASCADE, db_column='lightconditions_id')

class treatment(models.Model):
    treatment_id = models.IntegerField(primary_key=True)           
    surgerymanipulation = models.ForeignKey(surgerymanipulation, on_delete=models.CASCADE, db_column='surgerymanipulation_id')
    surgeryoutcome = models.ForeignKey(surgeryoutcome, on_delete=models.CASCADE, db_column='surgeryoutcome_id')        
    drugrx_drug1 = models.CharField(max_length=20,null=True)   
    drugrx_dose1 = models.CharField(max_length=100,null=True)  
    drugrx_drug2 = models.CharField(max_length=20,null=True)   
    drugrx_dose2 = models.CharField(max_length=100,null=True)  
    drugrx_drug3 = models.CharField(max_length=20,null=True)   
    drugrx_dose3 = models.CharField(max_length=100,null=True)  

class trial(models.Model):
    trial_id = models.IntegerField(primary_key=True)          
    dateandtime = models.CharField(max_length=100) 
    animalweight = models.IntegerField(null=True)          
    injectionnumber = models.IntegerField()          
    oftestnumber = models.IntegerField(null=True)          
    drugrxnumber = models.IntegerField()          
    experimenter = models.CharField(max_length=100) 
    duration = models.IntegerField()          
    fallsduringtest = models.IntegerField()          
    notes = models.CharField(max_length=2000,null=True)
    preprocessed = models.CharField(max_length=200,null=True)
    trackfile = models.CharField(max_length=200,null=True) 
    pathplot = models.CharField(max_length=200,null=True) 
    video = models.CharField(max_length=200,null=True) 
    video_id = models.CharField(max_length=100,null=True)
    eventtype = models.ForeignKey(eventtype, on_delete=models.CASCADE, db_column='eventtype_id')
    animal = models.ForeignKey(animal, on_delete=models.CASCADE, db_column='animal_id')
    apparatus = models.ForeignKey(apparatus, on_delete=models.CASCADE, db_column='apparatus_id')
    treatment = models.ForeignKey(treatment, on_delete=models.CASCADE, db_column='treatment_id')        


class fall(models.Model):
    id = models.AutoField(primary_key=True)
    trial = models.ForeignKey(trial, on_delete=models.CASCADE, db_column='trial_id') 
    timewhenfell = models.IntegerField() 

class experiment(models.Model):
    experiment_id = models.CharField(primary_key=True,max_length=100) 
    experimentdesc = models.CharField(max_length=200) 

class experimentgroup(models.Model):
    id = models.AutoField(primary_key=True)
    experiment = models.ForeignKey(experiment, on_delete=models.CASCADE, db_column='experiment_id')
    trial = models.ForeignKey(trial, on_delete=models.CASCADE, db_column='trial_id')

class study(models.Model):
    study_id = models.CharField(primary_key=True,max_length=3)      
    studydesc = models.CharField(max_length=200)     

class studygroup(models.Model):
    id = models.AutoField(primary_key=True)
    study = models.ForeignKey(study, on_delete=models.CASCADE, db_column='study_id')
    experiment = models.ForeignKey(experiment, on_delete=models.CASCADE, db_column='experiment_id')

class project(models.Model):
    project_id = models.IntegerField(primary_key=True)          
    projectdesc = models.CharField(max_length=200) 

class projectgroup(models.Model):
    id = models.AutoField(primary_key=True)
    project = models.ForeignKey(project, on_delete=models.CASCADE, db_column='project_id')
    study = models.ForeignKey(study, on_delete=models.CASCADE, db_column='study_id')

class timeseries(models.Model):
    id = models.AutoField(primary_key=True)
    trial = models.ForeignKey(trial, on_delete=models.CASCADE, db_column='trial_id')
    sample_id = models.IntegerField() 
    t = models.DecimalField(max_digits=10, decimal_places=2,null=True)
    x = models.DecimalField(max_digits=10, decimal_places=2,null=True)
    y = models.DecimalField(max_digits=10, decimal_places=2,null=True)
    x_s = models.DecimalField(max_digits=10, decimal_places=2,null=True)
    y_s = models.DecimalField(max_digits=10, decimal_places=2,null=True)
    v_s = models.DecimalField(max_digits=10, decimal_places=2,null=True)
    movementtype_s = models.IntegerField(null=True)