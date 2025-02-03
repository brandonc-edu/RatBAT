"""DependenciesSM

This module contains all of the required functionality in regards to proper planning of SM calculations (in particular, their dependencies).


Authors: Brandon Carrasco
Created on: 15-01-2025
Modified on: 24-01-2025
"""

# Summary Measure Dependencies

from FunctionalSM import DATA_DEPENDENCIES, SM_DEPENDENCIES


# Helper Class - Chain

# class Node:
    
#     def __init__(self, name):
#         self.name = name
#         self.needed = []
#         self.neededFor = []

#     def AddDependency(self, node):
#         self.needed.append(node)
    
#     def AddRequiredFor(self, node):
#         self.neededFor(node)
    
#     def GetName(self):
#         return self.name

# class Threads:

#     def __init__(self):
#         self.tails = []
#         self.heads = []
#         self.floaters = []
#         self.links = []

#     def FindSM(self):


#     def AddSM(name):

#     def CategorizeSMs(self):


# SMs can be floaters (no dependencies nor does anything depend on it) -> Automatically shoved to the back of the list
# SMs can be tails (no dependencies, but some SMs depend on it) -> Automatically shoved to the back of the list (in front of or behind the floaters; it doesn't matter)
# SMs can be heads (some dependencies, but nothing depends on it) -> Automatically shoved to the front of the list
# SMs can be links (some dependencies, but some other SMs depend on it as well) -> Run through list of SMs not in list
#   -> If all of an SM's dependencies are in the re-ordered list, add the SM to the list (before the heads)
#   -> Otherwise, skip over it and move onto the next one. Do so until all links have been added to the list. 
## O(n^2) time! But considering how few summary measures we'll be really calculating, I think it's alright.

# Karpov (The Summary Measure Dependency Resolver)

class Karpov:

    def __init__(self):
        pass

    def AddRequiredSummaryMeasures(self, summary_measures):
        """
            Given a list of summary measures, checks and produces a list of all dependencies (other summary measures) that must be calculated prior to them.
        """
        requiredSMs = []
        for sm in summary_measures:
            dependencies = SM_DEPENDENCIES[sm]
            if len(dependencies) > 0:
                requiredSMs = requiredSMs + [dep for dep in dependencies if dep not in summary_measures] # If dependency not already in summary measures, add it
        return requiredSMs

    def OrderSummaryMeasures(self, summary_measures):
        """
            Given a list of summary measures, re-orders such that all dependencies are calculated prior to their dependent summary measure.
        """
        full_dependencies = list(set([SM_DEPENDENCIES[sm] for sm in summary_measures]))
        head_SMs = [sm for sm in summary_measures if sm not in full_dependencies]
        floater_SMs = [sm for sm in summary_measures if sm not in full_dependencies and sm not in SM_DEPENDENCIES.keys()]
        tail_SMs = [sm for sm in summary_measures if sm in full_dependencies and sm not in SM_DEPENDENCIES.keys()]
        link_SMs = list(set(summary_measures) -  set(head_SMs + floater_SMs + tail_SMs))

        # Add all non-dependent SMs
        reordered_summary_measures = tail_SMs + floater_SMs

        # Iteratively add dependent SMs (that other SMs in the list are dependent on)
        while len(link_SMs) > 0:
            add_SMs = []
            for i in range(len(link_SMs)):
                link = link_SMs[i]
                if all(dep in reordered_summary_measures for dep in SM_DEPENDENCIES[link]): # Check if all dependencies for sm already exists in the reordered summary measures list
                    add_SMs.append(i)
            reordered_summary_measures = reordered_summary_measures + add_SMs # Add all summary measures whose dependencies are satisfied to the ordered list
            link_SMs = [sm for sm in link_SMs if sm not in add_SMs] # Remove all added summary measures

        # Add remaining purely dependent SMs
        reordered_summary_measures = reordered_summary_measures + head_SMs
        return reordered_summary_measures

    def ResolveDependencies(self, summary_measures):
        """
            Given a list of summary_measures, return list of data dependencies (aka. data that should be pre-calc'd for efficiency's sake) and the full re-ordered list of SMs that satisfy all SM dependencies.
        """
        data_depend = set()
        summary_reordered = []

        summary_reordered = self.AddRequiredSummaryMeasures(summary_measures) + summary_measures
        summary_reordered = self.OrderSummaryMeasures(summary_reordered)
        for sm in summary_reordered:
            # Grab data dependency (function to call) from data dependencies constant
            data_depend.add(DATA_DEPENDENCIES[sm])

        return summary_reordered, list(data_depend)

