"""CommanderSM

This module serves as the main entrypoint for calculating and (temporarily in code) storing summary measures.


Authors: Brandon Carrasco
Created on: 13-11-2024
Modified on: 16-11-2024
"""

import numpy as np
from . import FieldSM as fsm
from . import FunctionalSM as fcsm
import pandas as pd

### Summary Measure Dependency Helper ###

SM_DEPENDENCIES = {
    "calc_homebases" : [],
    "calc_HB1_cumulativeReturn" : ["calc_homebases"],
    "calc_HB1_meanDurationStops" : ["calc_homebases"],
    "calc_HB1_meanReturn" : ["calc_homebases"],
    "calc_HB1_meanExcursionStops" : ["calc_homebases"]
}


### Commander Class ###

class Commander:
    """
        The Commander class stores the relevant information to calculate summary measures,
        as well as communicating them to whatever functionality calls it.

        Think of the Commander class as a middleman. Very similar to the facade & adaptor design pattern.
    """

    def __init__(self, preProcessedData, environment):
        self.data =  preProcessedData
        self.env = self.SelectEnvironment(environment)
        self.storedAuxiliaryInfo = {}
        self.calculatedSummaryMeasures = {}

    def SelectEnvironment(self, environmentName):
        """
            Based on the environment name passed, select the environment that will be used by the Commander.

            Available environmentNames are: q20s (Q21 to Q23 environments), q17 (Q17 environment), and common (all other Qs' environment).
        """
        if environmentName == "common":
            return fsm.COMMON_ENV
        elif environmentName == "q20s":
            return fsm.Q20S_ENV
        elif environmentName == "q17":
            return fsm.Q17_ENV
        else:
            raise Exception("Invalid environmentName passed: please pass common, q20s, or q17 as the environmentName.")
        
    def PerformPreCalculations(self, summaryMeasures):
        """
            Scans the list of summary measures that the Commander wants calculated and determines if there are any pre-calculations of important data that could be done to reduce calculating the same thing over and over again.
            Criterion is that there are two or more summaryMeasures that use the same data -> fulfilled = that important data is calculated and stored for use in the actual summary measure calcuation.
            
            Updates self.storedAuxiliaryInfo with the store auxiliary calculations.

            summaryMeasures is a list of strings that correspond to the summary measures that will be calculated.

            NOT IMPLEMENTED YET
        """
        pass

    def SortCheckSMDependencies(self, summaryMeasures):
        """
            Given a list of summary measures, check if all summary measures that use summary measures for their calcuations:
                1. That the required summary measure is going to be calculated.
                2. That the required summary measure is going to be calculated before the dependent summary measure.

            In the case that (1) isn't satisfied, the summary measure is removed from the list with a warning.
            In the case that (2) isn't satisfied, the list of summary measures are reordered such that all dependencies come before their requirements. 
        """
        for i in range(len(summaryMeasures)):
            sm = summaryMeasures[i]
            
    def AccountForJitter(self, data: np.ndarray, min=20, max=180):
        """
            Given the preprocessed data, it will return the dataset with all x & y coordinates capped between 20 & 180 (the coordinate system used by the supervisors).
            This accounts for the rat being on the edges of the field -> the jitter of the tracking device sometimes makes the rat look like its crossing those boundaries, but its not.

            This is only being handled here for the purposes of the PoC -> Future iterations of the platform will handle jitter in the preprocessing step.
        """
        # x-coord
        data[:, 1] = np.clip(data[:, 1], min, max)
        # y-coord
        data[:, 2] = np.clip(data[:, 2], min, max)
        return data        
        

    def CalculateSummaryMeasures(self, data, summaryMeasures):
        """
            Calculates the list of summary measures that the Commander wants calculated on the dataset.

            summaryMeasures is a list of strings specifying which functions 

            Updates self.calculatedSummaryMeasures with calculated summary measures.
        """
        # Perform pre-calculations where possible to reduce overhead
        self.PerformPreCalculations(summaryMeasures)

        # Check summary measure dependencies 

        # Handle data jitter
        data = self.AccountForJitter(data)
        
        # Run through summary measures & calculate them
        ## 0 = frame
        ## 1 = x-coord
        ## 2 = y-coord
        ## 3 = velocity
        ## 4 = segmentType (lingering vs. progression)
        for sm in summaryMeasures: ## Developer's note
            if sm == "calc_homebases": # Takes in x, y, segmentType + environment
                homebases = fcsm.CalculateHomeBases(data[:, [1, 2, 4]], self.env)
                self.calculatedSummaryMeasures[sm] = {
                    "main_home_base": homebases[0],
                    "secondary_home_base": homebases[1]
                }
            elif sm == "calc_HB1_cumulativeReturn": # Takes in x, y, segmentType + mainHomeBase + environment
                self.calculatedSummaryMeasures[sm] = fcsm.CalculateFreqHomeBaseStops(data[:, [1, 2, 4]],
                                                                                     self.calculatedSummaryMeasures["calc_homebases"]["main_home_base"],
                                                                                     self.env)
            elif sm == "calc_HB1_meanDurationStops": # Takes in x, y, segmentType + mainHomeBase + environment
                self.calculatedSummaryMeasures[sm] = fcsm.CalculateMeanDurationHomeBaseStops(data[:, [1, 2, 4]],
                                                                                     self.calculatedSummaryMeasures["calc_homebases"]["main_home_base"],
                                                                                     self.env)
            elif sm == "calc_HB1_meanReturn": # Takes in x, y + mainHomeBase + environment
                if self.calculatedSummaryMeasures["calc_homebases"]["secondary_home_base"] is None:
                    print("WARNING: Cannot calculate mean return time to main home base, as second home base does not exist!")
                else:
                    self.calculatedSummaryMeasures[sm] = fcsm.CalculateMeanReturnHomeBase(data[:, [1, 2]],
                                                                                        self.calculatedSummaryMeasures["calc_homebases"]["main_home_base"],
                                                                                        self.env)
            elif sm == "calc_HB1_meanExcursionStops": # Takes in x, y, segmentType + mainHomeBase + environment
                if self.calculatedSummaryMeasures["calc_homebases"]["secondary_home_base"] is None:
                    print("WARNING: Cannot calculate mean number of stops during excursions (from main home base), as second home base does not exist!")
                else:
                    self.calculatedSummaryMeasures[sm] = fcsm.CalculateMeanStopsExcursions(data[:, [1, 2, 4]],
                                                                                     self.calculatedSummaryMeasures["calc_homebases"]["main_home_base"],
                                                                                     self.env)

### TESTING ###
# test = Commander(None, "common")
# data = pd.read_excel("./SummaryMeasures/testData.xlsx")
# # print(data.head()) # Getting 1.1 when I import it (for segmentType for the first row) which is weird, but not lethal for now.
# data = data.to_numpy()
# # print(data[:5])
# summaries = ["calc_homebases", "calc_HB1_cumulativeReturn", "calc_HB1_meanDurationStops", "calc_HB1_meanReturn", "calc_HB1_meanExcursionStops"]
# test.CalculateSummaryMeasures(data, summaries)
# print(test.calculatedSummaryMeasures)