"""FieldSM

This module contains all of the required functionality in regards to calculations based on the experiments' open field environment.


Authors: Brandon Carrasco
Created on: 07-11-2024
Modified on: 07-11-2024
"""

# Necessary Imports

import pandas as pd
import numpy as np

# Classes

## Physical Objects in the environment
class PhysicalObject:
    """
        PhysicalObject class specifies an object that exists on the open field environment.
    """

    def __init__(self, points):
        self.points = points
    
    def is_within(self, x, y):
        """
            Given x and y coordinates of an object, returns if the object is within (not on the edge, but inside) of the object.
        """
        pass

class Rectangle(PhysicalObject):

    def __init__(self, points):
        """
        Points is a list of length 2, containing tuples in the form: [(xMin, yMin), (xMax, yMax)], corresponding to the bottom left & top right corners of the rectangle.
        """
        super().__init__(points)

    def is_within(self, x, y):
        xMin, yMin = self.points[0]
        xMax, yMax = self.points[1]
        return (x > xMin and x < xMax) and (y > yMin and y < yMax)

class Polygon(PhysicalObject):

    def __init__(self, points):
        """
        Points is a list of tuples of length 2, with each tuple corresponding to the coordinates of one of the polygon's points. The final point in the tuple is the first point, thus closing the polygon.
        """
        super().__init__(points)
        # self.occupies = self.occupationGrid

    def is_within(self, x, y):
        pass

## Environment Class

class Environment:

    def __init__(self, grid, objects, shape):
        self.grid = grid
        self.objects = objects
        self.shape = shape

    def SpecimenLocation(self, x, y):
        """
            Given the x and y values of the specimen (assumed a rat), return which locale it is currently present in.
        """
        pass

# Specification of Environments
### Environments usually share the same grids + objects, but certain experiments use different grids and/or objects (and in one special case, a circular environment).

## Common Environment

## Q21 to Q23 Environments

## Q17 Environment

