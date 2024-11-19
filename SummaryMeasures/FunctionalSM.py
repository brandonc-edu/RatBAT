"""FunctionSM

This module contains all of the required functionality in regards to Summary Measure functions (their calculations)


Authors: Brandon Carrasco
Created on: 07-11-2024
Modified on: 16-11-2024
"""

# Imports
import numpy as np
# import pandas as pd
from . import FieldSM as fsm
from . FieldSM import GetLocaleFromIndex

# Constants

FRAMES_PER_SECOND = 29.97

### Defi


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

### Functions to Calculate Summary Measures ###


def CalculateHomeBases(movementType, env: fsm.Environment, preExistingCalcs=None):
    """
        Given an environment and matrix containing columns specifying the x-coords, y-coords, and movement type (lingering or progression) of the specimen per frame (every sample is one frame),
        return the two locales (main home base & secondary home base) of the specimen.

        If the main home base is visited only once, then return None for secondary home base. 

        Also referred to as fHBname01LING & fHBname02LING.

        Reference ID for Commander: calc_homebases
    """
    localeVisits = [0 for x in range(25)]
    localeDuration = [0 for x in range(25)]
    stopped = False
    # Count number of visits (and total duration of stops) for each locale
    for i in range(len(movementType)):
        frame = movementType[i]
        if frame[2] == 0:
            specimenLocale = env.SpecimenLocation(frame[0], frame[1], index=True)
            if not stopped:
                localeVisits[specimenLocale] += 1
                stopped = True
            localeDuration[specimenLocale] += 1
        else:
            stopped = False
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
    
def CalculateFreqHomeBaseStops(movementType, mainHomeBase: int, env: fsm.Environment):
    """
        Calculates the cumulative number of stops within the first home base

        Also referred to as KPcumReturnfreq01

        Reference ID is: calc_HB1_cumulativeReturn
    """
    numStops = 0
    stopped = False
    # Count number of visits (and total duration of stops) for each locale
    for i in range(len(movementType)):
        frame = movementType[i]
        if frame[2] == 0:
            specimenLocale = env.SpecimenLocation(frame[0], frame[1])
            if not stopped and specimenLocale == mainHomeBase:
                numStops += 1
                stopped = True
        else:
            stopped = False
    return numStops

def CalculateMeanDurationHomeBaseStops(movementType, mainHomeBase: int, env: fsm.Environment):
    """
        Calculates the mean duration (in seconds) of the specimen remaining in the main home base. Additionally returns the log (base 10) of this duration as well.

        Also referred to as KPmeanStayTime01_s & KPmeanStayTime01_s_log.

        Reference ID is: calc_HB1_meanDurationStops
    """
    numStops = 0
    totalDuration = 0
    stopped = False
    # Count number of visits (and total duration of stops) for each locale
    for i in range(len(movementType)):
        frame = movementType[i]
        if frame[2] == 0:
            specimenLocale = env.SpecimenLocation(frame[0], frame[1])
            if specimenLocale == mainHomeBase:
                if not stopped:
                    numStops += 1
                    stopped = True
                totalDuration += 1
        else:
            stopped = False
    duration_in_seconds = (totalDuration / numStops) / FRAMES_PER_SECOND
    return duration_in_seconds, np.log10(duration_in_seconds)

def CalculateMeanReturnHomeBase(movementType, mainHomeBase: int, env: fsm.Environment):
    """
        Calculates the mean return time to the main home base (in seconds). Also can be thought of as the mean duration of execursions.

        Also referred to as KPcumReturnfreq01

        Reference ID is: calc_HB1_meanReturn
    """
    totalExcursions = 0
    totalDuration = 0
    excursion = False
    # Count number of excursions (and their total duration) for each locale
    for i in range(len(movementType)):
        frame = movementType[i]
        specimenLocale = env.SpecimenLocation(frame[0], frame[1])
        if specimenLocale != mainHomeBase:
            totalDuration += 1
            if not excursion:
                totalExcursions += 1
                excursion = True
        else:
            excursion = False
    return (totalDuration / totalExcursions) / FRAMES_PER_SECOND

def CalculateMeanStopsExcursions(movementType, mainHomeBase: int, env: fsm.Environment):
    """
        Calculates the mean number of stops during excursions (away from the Main Home Base).

        Also referred to as KPstopsToReturn01

        Reference ID is: calc_HB1_meanExcursionStops
    """
    totalExcursions = 0
    totalStops = 0
    excursion = False
    # Count number of excursions (and their total stops) for each locale
    for i in range(len(movementType)):
        frame = movementType[i]
        specimenLocale = env.SpecimenLocation(frame[0], frame[1])
        if specimenLocale != mainHomeBase: # If the specimen is not in the main home base
            if frame[2] == 0: # If the specimen is lingering while on an excursion
                totalStops += 1
            if not excursion: # If the specimen is no longer in its main home base, it's on an excursion.
                totalExcursions += 1
                excursion = True
        else:
            excursion = False
    return (totalStops / totalExcursions) / FRAMES_PER_SECOND


# x = np.array([1, 5, 21, 1, 2, 5, 9, 21])
# print(x[np.argpartition(x, len(x) - 2)][-2:])

# x = 10
# print(np.log10(x))

# x = np.array([[1, 2, 3, 10], [4, 5, 6, 11], [7, 8, 9, 12]])
# print(x[:, [0, 2, 3]])

