"""CommanderSM

This module serves as the main entrypoint for calculating and (temporarily in code) storing summary measures.


Authors: Brandon Carrasco
Created on: 13-11-2024
Modified on: 14-11-2024
"""

import numpy as np
import FieldSM as fsm
import FunctionalSM as fcsm

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
        """

    def CalculateSummaryMeasures(self, summaryMeasures):
        """
            Calculates the list of summary measures that the Commander wants calculated on the dataset.

            Updates self.calculatedSummaryMeasures with calculated summary measures.
        """
        # Perform pre-calculations where possible to reduce overhead
        self.PerformPreCalculations(self, summaryMeasures)

        # Run through summary measures & calculate them
