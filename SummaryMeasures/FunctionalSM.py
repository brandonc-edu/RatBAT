"""FunctionSM

This module contains all of the required functionality in regards to Summary Measure functions (their calculations)


Authors: Brandon Carrasco
Created on: 07-11-2024
Modified on: 16-11-2024
"""

# Imports
import numpy as np
# import pandas as pd
import FieldSM as fsm
from FieldSM import GetLocaleFromIndex, GetIndexFromLocale

# Constants

FRAMES_PER_SECOND = 29.97

## Ref ids for Data & SMs

SM_MAPPING = {
    "calc_homebases" : "CalculateHomeBases",
    "calc_HB1_cumulativeReturn" : "CalculateFreqHomeBaseStops",
    "calc_HB1_meanDurationStops" : "CalculateMeanDurationHomeBaseStops",
    "calc_HB1_meanReturn" : "CalculateMeanReturnHomeBase",
    "calc_HB1_meanExcursionStops" : "CalculateMeanStopsExcursions"
}

DATA_MAPPING = {
    "locale_stops_calc" : "CalculateStops"
}


## Storing Dependencies for Summary Measures and Common Calcs
## SM Dependencies
### All SMs that are dependent on other SMs to be calculated appear here in this dict.
### Their values is a list of summary measures that must be calculated before the key SM is calculated.
SM_DEPENDENCIES = {
    "calc_HB1_cumulativeReturn" : ["calc_homebases"],
    "calc_HB1_meanDurationStops" : ["calc_homebases"],
    "calc_HB1_meanReturn" : ["calc_homebases"],
    "calc_HB1_meanExcursionStops" : ["calc_homebases"]
}

## Data Dependencies
### Dictionary of summary measure names (strings) matched to the functions that calculate the metrics that the summary measure needs.
DATA_DEPENDENCIES = {
    "calc_homebases" : ["locale_stops_calc"],
    "calc_HB1_cumulativeReturn" : ["locale_stops_calc"],
    "calc_HB1_meanDurationStops" : ["locale_stops_calc"],
    "calc_HB1_meanReturn" : ["locale_stops_calc"],
    "calc_HB1_meanExcursionStops" : ["locale_stops_calc"],
}


### Commander-Specific Helper Functions (calculation of data mainly) ###

def CalculateLocale(movementMat, env: fsm.Environment):

    """
        Calculates and returns a vector of locales that the specimen is in at a specific x, y coordinate.
    """
    locales = []
    for i in range(len(movementMat)):
        frame = movementMat[i]
        locales.append(env.SpecimenLocation(frame[0], frame[1]))
    return np.array(locales)

    

def CalculateHomeBaseMetrics(movementType, env: fsm.Environment, localeVector=None):
    """
        Given an environment and matrix containing columns specifying the x-coords, y-coords, and movement type (lingering or progression) of the specimen per frame (every sample is one frame),
        return the information necessary to calculate all other summary measures.

        Will return main home base duration, visits, and rat locale location (empty list if provided as parameter).

        Durations are recorded in frames. Divide by FRAMES_PER_SECOND to obtain their values in seconds.

        TO BE IMPLEMENTED (to save on computation time)
    """
    totalLocaleVisits = [0 for x in range(25)]
    totalLocaleStopDurations = [0 for x in range(25)]
    totalLocaleDurations = [0 for x in range(25)]
    specimenLocaleVector = []
    currentLocale = localeVector
    stopped = False # In the case that our stops need to involve moving outside of the current locale before recording another stop, then it'll be pretty easy to implement -> stopped = locale (can't be current locale of the specimen to record a visit)
    for i in range(len(movementType)):
        frame = movementType[i]
        if localeVector == None: # If no locale vector was passed as argument (finding it for the first time), find the specimen's locale and add it to the new locale vector.
            specimenLocale = env.SpecimenLocation(frame[0], frame[1]) - 1
            specimenLocaleVector.append(specimenLocale + 1)
        if frame[2] == 0: # If specimen is lingering/stopped in the locale.
            if localeVector != None: # If we were already passed the localeVector as a function argument, then use the localeVector's value for that frame
                specimenLocale = localeVector[i] - 1
            if not stopped: # If we haven't recorded a stop in this locale already -> do so, and freeze it so we don't record multiple stops.
                totalLocaleVisits[specimenLocale] += 1
                stopped = True
            totalLocaleStopDurations[specimenLocale] += 1 # Record stop duration
        else:
            stopped = False
        totalLocaleDurations[specimenLocale] += 1 # Record total durations that specimen spends in each locale
        
    return totalLocaleVisits, totalLocaleStopDurations, totalLocaleDurations, specimenLocaleVector


### Calculating metrics

def CalculateHomeBaseMetrics(movementType, env: fsm.Environment):
    """
        Given an environment and matrix containing columns specifying the x-coords, y-coords, and movement type (lingering or progression) of the specimen per frame (every sample is one frame),
        return the information necessary to calculate all other summary measures.

        Will return main home base duration, visits, and rat locale location (empty list if provided as parameter).

        Durations are recorded in frames. Divide by FRAMES_PER_SECOND to obtain their values in seconds.

        TO BE IMPLEMENTED (to save on computation time)
    """
    totalLocaleVisits = [0 for x in range(25)]
    totalLocaleStopDurations = [0 for x in range(25)]
    totalLocaleDurations = [0 for x in range(25)]
    currentLocale = None
    stopped = False # In the case that our stops need to involve moving outside of the current locale before recording another stop, then it'll be pretty easy to implement -> stopped = locale (can't be current locale of the specimen to record a visit)
    for i in range(len(movementType)):
        frame = movementType[i]
        currentLocale = env.SpecimenLocation(frame[0], frame[1]) - 1
        if frame[2] == 0: # If specimen is lingering/stopped in the locale.
            if localeVector != None: # If we were already passed the localeVector as a function argument, then use the localeVector's value for that frame
                specimenLocale = localeVector[i] - 1
            if not stopped: # If we haven't recorded a stop in this locale already -> do so, and freeze it so we don't record multiple stops.
                totalLocaleVisits[specimenLocale] += 1
                stopped = True
            totalLocaleStopDurations[specimenLocale] += 1 # Record stop duration
        else:
            stopped = False
        totalLocaleDurations[specimenLocale] += 1 # Record total durations that specimen spends in each locale
        
    return totalLocaleVisits, totalLocaleStopDurations, totalLocaleDurations, specimenLocaleVector

# def CalculateStops # Each functions returns a list of tuples of the form: (NAME IN AUXILARY INFO, DATA)

def CalculateStops(data, env: fsm.Environment):
    """
        Given the raw time-series data and environment of the experiment, calculates the stops in each locale, as well as the total duration of the stops (in frames) for each locale.
    """
    stopLocales = [0 for x in range(25)]
    stopFrames = [0 for x in range(25)]
    stopped = False
    
    for i in range(len(data)):
        frame = data[i]
        if frame[4] == 0: # If this is a stop
            specimenLocale =  env.SpecimenLocation(frame[1], frame[2], index=True) # Get current locale of specimen
            # Count the stop
            if not stopped: # If it was previously moving and just now stopped
                stopped = True
                locDur = [0 for x in range(25)]
            locDur[specimenLocale] += 1
        elif frame[4] == 1 and stopped: # If it's begun moving and was previously stopped
            stopped = False
            # Get the maximum duration for each locale and add a stop to the max locale
            maxLocale = np.argmax(stopFrames)
            stopLocales[maxLocale] += 1
            # Add stop frames to total stop durations
            stopFrames = [sum(comb) for comb in zip(stopFrames, locDur)]
            # Reset local locale stop durations (for a stop episode)
            locDur = [0 for x in range(25)]
    return stopLocales, stopFrames

### NEW Functions to Calculate Summary Measures

def CalculateMissingCalcs(data, env: fsm.Environment, preExistingCalcs, calcs):
    """
        Given a list calcuations, determin
    """
    # Find missing calcs
    desiredCalcs = {}
    if preExistingCalcs != None: # If passed pre-existing data, find any pre-calculated data that's missing (that will be calculated)
        missingCalcs = list(set(calcs) - set(preExistingCalcs.keys()))
        for calc in list(set(calcs) - set(missingCalcs)): # Add all already existing calcs to the desired calcs dictionary
            desiredCalcs[calc] = preExistingCalcs[calc]
    else:
        missingCalcs = calcs # If no pre-existing data passed, then calculated all required data.

    # Calculate Missing Calcs
    for missingCalc in missingCalcs: # Calculate all missing calculations and add them to the desired calcs dictionary
        calcFunc = globals()[DATA_MAPPING[missingCalc]]
        desiredCalcs[missingCalc] = calcFunc(data, env)

    # Return as dict for use in the summary measure function
    
    return desiredCalcs

def CheckForMissingDependencies(calc, preExistingSMs):
    """
        Confirms that the selected calc has all of its summary measure dependencies calculated. Throws error otherwise.
    """
    if calc not in SM_DEPENDENCIES.keys(): # If desired SM requires no summary measures to be calculated, then everything's fine
        return
    dependencies = SM_DEPENDENCIES[calc]
    notCalculated = set(dependencies) - set(preExistingSMs)
    if len(notCalculated) != 0: # If some dependencies still haven't been calculated
        print(f"Attempting to calculate {calc}, but missing the following necessary summary measures:")
        for sm in notCalculated:
            print(f"     - {sm}")
        raise Exception("Error: Missing one or more summary measures necessary to calculate another summary measure!")

def CalculateHomeBases(data, env: fsm.Environment, requiredSummaryMeasures, preExistingCalcs=None):
    """
        Given an environment and matrix containing columns specifying the x-coords, y-coords, and movement type (lingering or progression) of the specimen per frame (every sample is one frame),
        return the two locales (main home base & secondary home base) of the specimen.

        If the main home base is visited only once, then return None for secondary home base. 

        Also referred to as KPname01 & KPname02.

        Reference ID for Commander: calc_homebases
    """
    ### Perform necessary calculations on the data!
    # TEMPORARY -> any required calc names should be stored in Data Dependences, which will be moved over to this file soon.
    requiredCalcs = DATA_DEPENDENCIES["calc_homebases"]
    desiredCalcs = CalculateMissingCalcs(data, env, preExistingCalcs, requiredCalcs)

    ### Summary Measure Logic
    localeVisits = desiredCalcs['locale_stops_calc'][0]
    localeDuration = desiredCalcs['locale_stops_calc'][1]

    # Calculate home bases
    topTwoMostVisited = np.argpartition(np.array(localeVisits), len(localeVisits) - 2)[-2:]
    localeA = topTwoMostVisited[0]
    localeB = topTwoMostVisited[1]
    # Check & handle tiebreaker
    if localeVisits[localeA] == localeVisits[localeB]:
        mainHomeBase = localeA if localeDuration[localeA] >= localeDuration[localeB] else localeB
    else:
        mainHomeBase = localeA if localeVisits[localeA] > localeVisits[localeB] else localeB
    secondaryHomeBase = localeA if mainHomeBase == localeB else localeB
    if localeA < 2 and localeB < 2: # In case that there's less than two stops for main home base. In this case, the home base would essentially be a random locale that has one stop in it.
        return GetLocaleFromIndex(mainHomeBase), None
    else:
        return GetLocaleFromIndex(mainHomeBase), GetLocaleFromIndex(secondaryHomeBase)

def CalculateFreqHomeBaseStops(data, env: fsm.Environment, requiredSummaryMeasures, preExistingCalcs=None):
    """
        Calculates the cumulative number of stops within the first home base. Requires the First Home Base to have been calculated (ref. id. calc_homebases)

        Also referred to as KPcumReturnfreq01

        Reference ID is: calc_HB1_cumulativeReturn
    """
    # Check if required summary measures have been calculated already
    CheckForMissingDependencies('calc_HB1_cumulativeReturn', requiredSummaryMeasures.keys())
    # Perform any necessary pre-calcs
    requiredCalcs = DATA_DEPENDENCIES["calc_HB1_cumulativeReturn"]
    desiredCalcs = CalculateMissingCalcs(data, env, preExistingCalcs, requiredCalcs)

    ### Summary Measure Logic
    localeVisits = desiredCalcs['locale_stops_calc'][0]
    mainHomeBase = requiredSummaryMeasures['calc_homebases'][0]

    # Constraint: cannot calculate the summary measure if 2nd home base isn't present
    # if requiredSummaryMeasures["calc_homebases"][1] == None:
    #     print("WARNING: Cannot calculate mean return time to main home base, as second home base does not exist!")
    #     return None
    
    ind = GetIndexFromLocale(mainHomeBase)
    return localeVisits[ind]

def CalculateMeanDurationHomeBaseStops(data, env: fsm.Environment, requiredSummaryMeasures, preExistingCalcs=None):
    """
        Calculates the mean duration (in seconds) of the specimen remaining in the main home base. Additionally returns the log (base 10) of this duration as well.

        Also referred to as KPmeanStayTime01_s & KPmeanStayTime01_s_log.

        Reference ID is: calc_HB1_meanDurationStops
    """
    # Check if required summary measures have been calculated already
    CheckForMissingDependencies('calc_HB1_meanDurationStops', requiredSummaryMeasures.keys())
    # Perform any necessary pre-calcs
    requiredCalcs = DATA_DEPENDENCIES["calc_HB1_meanDurationStops"]
    desiredCalcs = CalculateMissingCalcs(data, env, preExistingCalcs, requiredCalcs)

    ### Summary Measure Logic
    localeVisits = desiredCalcs['locale_stops_calc'][0]
    localeDuration = desiredCalcs['locale_stops_calc'][1]
    mainHomeBase = requiredSummaryMeasures['calc_homebases'][0]

    ind = GetIndexFromLocale(mainHomeBase)
    totalDuration = localeDuration[ind]
    numStops = localeVisits[ind]

    duration_in_seconds = (totalDuration / numStops) / FRAMES_PER_SECOND
    return duration_in_seconds, np.log10(duration_in_seconds)

def CalculateMeanReturnHomeBase(data, env: fsm.Environment, requiredSummaryMeasures, preExistingCalcs=None):
    """
        Calculates the mean return time to the main home base (in seconds). Also can be thought of as the mean duration of execursions.

        Also referred to as KPcumReturnfreq01

        Reference ID is: calc_HB1_meanReturn
    """
    # Check if required summary measures have been calculated already
    CheckForMissingDependencies('calc_HB1_meanReturn', requiredSummaryMeasures.keys())
    # Perform any necessary pre-calcs
    requiredCalcs = DATA_DEPENDENCIES["calc_HB1_meanReturn"]
    desiredCalcs = CalculateMissingCalcs(data, env, preExistingCalcs, requiredCalcs)

    ### Summary Measure Logic
    localeVisits = desiredCalcs['locale_stops_calc'][0]
    localeDuration = desiredCalcs['locale_stops_calc'][1]
    mainHomeBase = requiredSummaryMeasures['calc_homebases'][0]

    # Constraint: cannot calculate the summary measure if 2nd home base isn't present
    if requiredSummaryMeasures["calc_homebases"][1] == None:
        print("WARNING: Cannot calculate mean return time to main home base, as second home base does not exist!")
        return None
    
    ind = GetIndexFromLocale(mainHomeBase)
    # Sum of all durations and stops minus the ones that are in the main home base
    totalDuration = sum(localeDuration) - localeDuration[ind]
    totalExcursions = sum(localeVisits) - localeVisits[ind]
    return (totalDuration / totalExcursions) / FRAMES_PER_SECOND

def CalculateMeanStopsExcursions(data, env: fsm.Environment, requiredSummaryMeasures, preExistingCalcs=None):
    """
        Calculates the mean number of stops during excursions (away from the Main Home Base).

        Also referred to as KPstopsToReturn01

        Reference ID is: calc_HB1_meanExcursionStops
    """
    # Check if required summary measures have been calculated already
    CheckForMissingDependencies('calc_HB1_meanExcursionStops', requiredSummaryMeasures.keys())
    # Perform any necessary pre-calcs
    requiredCalcs = DATA_DEPENDENCIES["calc_HB1_meanExcursionStops"]
    desiredCalcs = CalculateMissingCalcs(data, env, preExistingCalcs, requiredCalcs)

    ### Summary Measure Logic
    # localeVisits = desiredCalcs['locale_stops_calc'][0]
    # localeDuration = desiredCalcs['locale_stops_calc'][1]
    mainHomeBase = requiredSummaryMeasures['calc_homebases'][0]

    totalExcursions = 0
    totalStops = 0
    excursion = False
    stopped = False
    # Count number of excursions (and their total stops) for each locale
    for i in range(len(data)):
        frame = data[i]
        specimenLocale = env.SpecimenLocation(frame[1], frame[2])
        if specimenLocale != mainHomeBase: # If the specimen is not in the main home base
            if frame[4] == 1 and not excursion: # If the specimen is no longer in its main home base, it's on an excursion. Has to be moving in a progressive episode to be counted as an excursion (lingering between main home base and elsewhere doesn't count).
                totalExcursions += 1
                excursion = True
            if frame[4] == 0 and excursion and not stopped: # If the specimen is lingering while on an excursion
                totalStops += 1
                stopped = True
            elif frame[4] == 1:
                stopped = False 
        else:
            excursion = False
    return totalStops / totalExcursions


### Functions to Calculate Summary Measures ###


# def CalculateHomeBases(movementType, env: fsm.Environment, preExistingCalcs=None):
#     """
#         Given an environment and matrix containing columns specifying the x-coords, y-coords, and movement type (lingering or progression) of the specimen per frame (every sample is one frame),
#         return the two locales (main home base & secondary home base) of the specimen.

#         If the main home base is visited only once, then return None for secondary home base. 

#         Also referred to as fHBname01LING & fHBname02LING.

#         Reference ID for Commander: calc_homebases
#     """
#     localeVisits = [0 for x in range(25)]
#     localeDuration = [0 for x in range(25)]
#     stopped = False
#     currentLocale = -1
#     # Count number of visits (and total duration of stops) for each locale
#     for i in range(len(movementType)):
#         frame = movementType[i]
#         if frame[2] == 0: # Stopped
#             specimenLocale = env.SpecimenLocation(frame[0], frame[1], index=True) # Get current locale of specimen
#             # Count the stop
#             if not stopped: # If it was previously moving and just now stopped
#                 localeVisits[specimenLocale] += 1
#                 currentLocale = specimenLocale
#                 stopped = True
#             elif stopped and currentLocale != specimenLocale: # If it's stopped and slightly lingered into an adjacent locale (think sitting on the borders)
#                 localeVisits[specimenLocale] += 1
#                 currentLocale = specimenLocale
#             # Count the time spent stopped in a locale
#             localeDuration[specimenLocale] += 1
#         else: # If it's moving, then make sure we revert the stopped flag
#             stopped = False
#     # Calculate home bases
#     topTwoMostVisited = np.argpartition(np.array(localeVisits), len(localeVisits) - 2)[-2:]
#     localeA = topTwoMostVisited[0]
#     localeB = topTwoMostVisited[1]
#     # Check & handle tiebreaker
#     if localeVisits[localeA] == localeVisits[localeB]:
#         mainHomeBase = localeA if localeDuration[localeA] >= localeDuration[localeB] else localeB
#     else:
#         mainHomeBase = localeA if localeVisits[localeA] > localeVisits[localeB] else localeB
#     secondaryHomeBase = localeA if mainHomeBase == localeB else localeB
#     if localeA < 2 and localeB < 2: # In case that there's less than two stops for main home base. In this case, the home base would essentially be a random locale that has one stop in it.
#         return GetLocaleFromIndex(mainHomeBase), None
#     else:
#         return GetLocaleFromIndex(mainHomeBase), GetLocaleFromIndex(secondaryHomeBase)
    
# def CalculateFreqHomeBaseStops(movementType, mainHomeBase: int, env: fsm.Environment):
#     """
#         Calculates the cumulative number of stops within the first home base

#         Also referred to as KPcumReturnfreq01

#         Reference ID is: calc_HB1_cumulativeReturn
#     """
#     numStops = 0
#     stopped = False
#     homeBase = False
#     currentLocale = -1
#     # Count number of visits (and total duration of stops) for each locale
#     for i in range(len(movementType)):
#         frame = movementType[i]
#         if frame[2] == 0: # Get current locale of specimen
#             specimenLocale = env.SpecimenLocation(frame[0], frame[1])
#             if (not stopped and specimenLocale == mainHomeBase) or (stopped and not homeBase and specimenLocale == mainHomeBase): # If we stop or linger back into the homebase, count the stop.
#                 numStops += 1
#                 stopped = True
#                 homeBase = True
#             elif stopped and specimenLocale != mainHomeBase: # If the specimen lingers into another locale, we set homeBase to false such that if it lingers back into homeBase, it's counted as another stop.
#                 homeBase = False
#             currentLocale = specimenLocale
#         else:
#             stopped = False
#     return numStops

# def CalculateMeanDurationHomeBaseStops(movementType, mainHomeBase: int, env: fsm.Environment):
#     """
#         Calculates the mean duration (in seconds) of the specimen remaining in the main home base. Additionally returns the log (base 10) of this duration as well.

#         Also referred to as KPmeanStayTime01_s & KPmeanStayTime01_s_log.

#         Reference ID is: calc_HB1_meanDurationStops
#     """
#     numStops = 0
#     totalDuration = 0
#     stopped = False
#     # Count number of visits (and total duration of stops) for each locale
#     for i in range(len(movementType)):
#         frame = movementType[i]
#         if frame[2] == 0:
#             specimenLocale = env.SpecimenLocation(frame[0], frame[1])
#             if specimenLocale == mainHomeBase:
#                 if not stopped:
#                     numStops += 1
#                     stopped = True
#                 totalDuration += 1
#         else:
#             stopped = False
#     duration_in_seconds = (totalDuration / numStops) / FRAMES_PER_SECOND
#     return duration_in_seconds, np.log10(duration_in_seconds)

# def CalculateMeanReturnHomeBase(movementType, mainHomeBase: int, env: fsm.Environment):
#     """
#         Calculates the mean return time to the main home base (in seconds). Also can be thought of as the mean duration of execursions.

#         Also referred to as KPcumReturnfreq01

#         Reference ID is: calc_HB1_meanReturn
#     """
#     totalExcursions = 0
#     totalDuration = 0
#     excursion = False
#     # Count number of excursions (and their total duration) for each locale
#     for i in range(len(movementType)):
#         frame = movementType[i]
#         specimenLocale = env.SpecimenLocation(frame[0], frame[1])
#         if specimenLocale != mainHomeBase:
#             totalDuration += 1
#             if not excursion:
#                 totalExcursions += 1
#                 excursion = True
#         else:
#             excursion = False
#     return (totalDuration / totalExcursions) / FRAMES_PER_SECOND

# def CalculateMeanStopsExcursions(movementType, mainHomeBase: int, env: fsm.Environment):
#     """
#         Calculates the mean number of stops during excursions (away from the Main Home Base).

#         Also referred to as KPstopsToReturn01

#         Reference ID is: calc_HB1_meanExcursionStops
#     """
#     totalExcursions = 0
#     totalStops = 0
#     excursion = False
#     # Count number of excursions (and their total stops) for each locale
#     for i in range(len(movementType)):
#         frame = movementType[i]
#         specimenLocale = env.SpecimenLocation(frame[0], frame[1])
#         if specimenLocale != mainHomeBase: # If the specimen is not in the main home base
#             if frame[2] == 0: # If the specimen is lingering while on an excursion
#                 totalStops += 1
#             if not excursion: # If the specimen is no longer in its main home base, it's on an excursion.
#                 totalExcursions += 1
#                 excursion = True
#         else:
#             excursion = False
#     return (totalStops / totalExcursions) / FRAMES_PER_SECOND


# x = np.array([1, 5, 21, 1, 2, 5, 9, 21])
# print(x[np.argpartition(x, len(x) - 2)][-2:])

# x = 10
# print(np.log10(x))

# x = np.array([[1, 2, 3, 10], [4, 5, 6, 11], [7, 8, 9, 12]])
# print(x[:, [0, 2, 3]])

