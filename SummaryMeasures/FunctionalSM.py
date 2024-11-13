"""FunctionSM

This module contains all of the required functionality in regards to Summary Measure functions (their calculations)


Authors: Brandon Carrasco
Created on: 07-11-2024
Modified on: 12-11-2024
"""

# Imports
import numpy as np
# import pandas as pd
import FieldSM as fsm

# Constants

FRAMES_PER_SECOND = 29.97

### Defining Stops


### 

def CalculateHomeBaseMetrics(movementType, env):
    """
        Given an environment and matrix containing columns specifying the x-coords, y-coords, and movement type (lingering or progression) of the specimen per frame (every sample is one frame),
        return the information necessary to calculate all other summary measures.

        TO BE IMPLEMENTED (to save on computation time)
    """
    pass

def CalculateHomeBase(movementType, env: fsm.Environment) -> bool:
    """
        Given an environment and matrix containing columns specifying the x-coords, y-coords, and movement type (lingering or progression) of the specimen per frame (every sample is one frame),
        return the two locales (main home base & secondary home base) of the specimen.

        If the main home base is visited only once, then return None for secondary home base. 
    """
    localeVisits = [x for x in range(25)]
    localeDuration = [x for x in range(25)]
    stopped = False
    # Count number of visits (and total duration of stops) for each locale
    for i in range(len(movementType)):
        frame = movementType[i]
        if frame[2] == 0:
            specimenLocale = env.SpecimenLocation(frame[0], frame[1]) - 1
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
        return mainHomeBase, None
    else:
        return mainHomeBase, secondaryHomeBase

# x = np.array([1, 5, 21, 1, 2, 5, 9, 21])
# print(x[np.argpartition(x, len(x) - 2)][-2:])




