# RatBAT


## Why is this Project Worthwhile?

Years of spatial-time data collection of rats induced with OCD-like behavior has created a gargantuan database stored within the Federated Research Data Repository’s (FRDR) repository. Recent advancements in Machine Learning have made it possible to create a talking animal model of OCD, essentially a narration of the rat’s thoughts, by using the collected data. This talking animal model will allow neuropsychologists and other interested parties to better understand and thus treat people afflicted with OCD. In pursuit of this talking animal model, it’s now necessary to create a platform that will allow for efficient selection and download of the spatial-time data, as well as an extensible toolkit of summary measures (statistical functions and ML algorithms) to compute additional features to enrich the information that the dataset provides.

Researchers, such as our supervisors or others aiming to use the rat data hosted on the FRDR for their own novel projects, will benefit greatly from our project. Our supervisor's efforts, based on the foundation we’ll provide, will directly affect the psychopathological understanding and treatment of those with OCD. As this is the first part of a multi-phase project, the foundation our team is laying down will assist future software developers working on later phases of this project. Finally, we as the developers of these platforms and tools, are stakeholders in the quality of the work produced.

## How to access this project?

This project is temporarily hosted on: http://ratbat.cas.mcmaster.ca/  
(Note that in order to access this website you must be either on McMaster campus or using the McMaster VPN)

The Summary Measures & Preprocessing Toolkit package can be found at: https://pypi.org/project/rBat/

## Quick guide for TAs to go through the webapp end-to-end fast:
In STEP 1: FRDR Query select the Trial filter → type in a number like 13186 in the first textbox (trial id:) → Apply button → Load Data from FRDR button. 
Then in STEP 2: Data Preprocessing select the trial and click Fetch Preprocessed button.
Proceed to step 3 and 4.

Why?: Some trials such as 13186 already have preprocessed data in the database, this saves around 7-10 minutes of waiting for preprocessing to complete.
