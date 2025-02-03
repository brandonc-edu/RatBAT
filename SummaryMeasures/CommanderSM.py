"""CommanderSM

This module serves as the main entrypoint for calculating and (temporarily in code) storing summary measures.


Authors: Brandon Carrasco
Created on: 13-11-2024
Modified on: 24-01-2025
"""

import numpy as np
import FieldSM as fsm
import FunctionalSM as fcsm
from FunctionalSM import DATA_MAPPING, SM_MAPPING
import pandas as pd

### Summary Measure Dependency Helper ###

# Maps reference ids to function names

# SM_MAPPING = {
#     "calc_homebases" : "CalculateHomeBases"
# }

# DATA_MAPPING = {
#     "locale_stop_calc" : "Placeholder"
# }



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
        
    def PerformPreCalculations(self, data, env: fsm.Environment, commonCalculations):
        """
            Scans the list of summary measures that the Commander wants calculated and determines if there are any pre-calculations of important data that could be done to reduce calculating the same thing over and over again.
            Criterion is that there are two or more summaryMeasures that use the same data -> fulfilled = that important data is calculated and stored for use in the actual summary measure calcuation.
            
            Updates self.storedAuxiliaryInfo with the store auxiliary calculations.

            summaryMeasures is a list of strings that correspond to the summary measures that will be calculated.
        """
        # Run through each calculation and add them to the storedAuxiliaryInfo dictionary
        for cCalc in commonCalculations:
            func = getattr(fcsm, DATA_MAPPING[cCalc])
            self.storedAuxiliaryInfo[cCalc] = func(data, env)

    # def SortCheckSMDependencies(self, summaryMeasures):
    #     """
    #         Given a list of summary measures, check if all summary measures that use summary measures for their calcuations:
    #             1. That the required summary measure is going to be calculated.
    #             2. That the required summary measure is going to be calculated before the dependent summary measure.

    #         In the case that (1) isn't satisfied, the summary measure is removed from the list with a warning.
    #         In the case that (2) isn't satisfied, the list of summary measures are reordered such that all dependencies come before their requirements. 
    #     """
    #     for i in range(len(summaryMeasures)):
    #         sm = summaryMeasures[i]
            
        

    def CalculateSummaryMeasures(self, data, summaryMeasures, commonCalculations):
        """
            Calculates the list of summary measures that the Commander wants calculated on the dataset.

            summaryMeasures is a list of strings specifying which functions 

            Updates self.calculatedSummaryMeasures with calculated summary measures.
        """
        # Perform pre-calculations where possible to reduce overhead
        self.PerformPreCalculations(data, self.env, commonCalculations)



        # Run through summary measures & calculate them
        for sm in summaryMeasures:
            func = getattr(fcsm, SM_MAPPING[sm])
            self.calculatedSummaryMeasures[sm] = func(data, self.env, self.calculatedSummaryMeasures, self.storedAuxiliaryInfo)


        ## 0 = frame
        ## 1 = x-coord
        ## 2 = y-coord
        ## 3 = velocity
        ## 4 = segmentType (lingering vs. progression)
        # for sm in summaryMeasures: ## Developer's note
        #     if sm == "calc_homebases": # Takes in x, y, segmentType + environment
        #         self.calculatedSummaryMeasures[sm] = fcsm.CalculateHomeBases(data[:, [1, 2, 4]], self.env)
        #     elif sm == "calc_HB1_cumulativeReturn": # Takes in x, y, segmentType + mainHomeBase + environment
        #         self.calculatedSummaryMeasures[sm] = fcsm.CalculateFreqHomeBaseStops(data[:, [1, 2, 4]],
        #                                                                              self.calculatedSummaryMeasures["calc_homebases"][0],
        #                                                                              self.env)
        #     elif sm == "calc_HB1_meanDurationStops": # Takes in x, y, segmentType + mainHomeBase + environment
        #         self.calculatedSummaryMeasures[sm] = fcsm.CalculateMeanDurationHomeBaseStops(data[:, [1, 2, 4]],
        #                                                                              self.calculatedSummaryMeasures["calc_homebases"][0],
        #                                                                              self.env)
        #     elif sm == "calc_HB1_meanReturn": # Takes in x, y + mainHomeBase + environment
        #         if self.calculatedSummaryMeasures["calc_homebases"][1] == None:
        #             print("WARNING: Cannot calculate mean return time to main home base, as second home base does not exist!")
        #         else:
        #             self.calculatedSummaryMeasures[sm] = fcsm.CalculateMeanReturnHomeBase(data[:, [1, 2]],
        #                                                                                 self.calculatedSummaryMeasures["calc_homebases"][0],
        #                                                                                 self.env)
        #     elif sm == "calc_HB1_meanExcursionStops": # Takes in x, y, segmentType + mainHomeBase + environment
        #         if self.calculatedSummaryMeasures["calc_homebases"][1] == None:
        #             print("WARNING: Cannot calculate mean number of stops during excursions (from main home base), as second home base does not exist!")
        #         else:
        #             self.calculatedSummaryMeasures[sm] = fcsm.CalculateMeanStopsExcursions(data[:, [1, 2, 4]],
        #                                                                              self.calculatedSummaryMeasures["calc_homebases"][0],
        #                                                                              self.env)

### TESTING ###
# test = Commander(None, "common")
# data = pd.read_excel("./SummaryMeasures/testData.xlsx")
# # print(data.head()) # Getting 1.1 when I import it (for segmentType for the first row) which is weird, but not lethal for now.
# data = data.to_numpy()
# # print(data[:5])
# summaries = ["calc_homebases", "calc_HB1_cumulativeReturn", "calc_HB1_meanDurationStops", "calc_HB1_meanReturn", "calc_HB1_meanExcursionStops"]
# test.CalculateSummaryMeasures(data, summaries)
# print(test.calculatedSummaryMeasures)