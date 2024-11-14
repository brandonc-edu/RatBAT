"""FieldSM

This module contains all of the required functionality in regards to calculations based on the experiments' open field environment.


Authors: Brandon Carrasco
Created on: 07-11-2024
Modified on: 14-11-2024
"""

# Necessary Imports

# import pandas as pd
import numpy as np
from shapely.geometry import Point
from shapely.geometry import Polygon
from shapely.prepared import prep
from itertools import chain

# Constants

LOCALE_MAPPING = [22, 21, 20, 19, 18,
                  23, 8, 7, 6, 17,
                  24, 9, 1, 5, 16,
                  25, 2, 3, 4, 15,
                  10, 11, 12, 13, 14]

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
        # self.bounds = self.MaxBounds()
        self.polygon = prep(Polygon(points))
        # self.occupies = self.occupationGrid

    # def MaxBounds(self):
    #     """
    #         Finds the maximum possible boundaries of the polygon, representing them as two tuples of x, y coordinates
    #     """
    #     xCoords, yCoords = list(zip(*self.points))
    #     return [(min(xCoords), min(yCoords)), (max(xCoords), max(yCoords))]
    
    # def GenerateSegments(self):
    #     """
    #         Generates the lines between each point.
    #     """
    #     def SolveForM(coordA, coordB):
    #         """
    #             Solves for m in y = mx + b, when given two coordinates.
    #         """
    #         return (coordA[0] - coordB[0]) / (coordA[1] - coordB[1])
        
    #     def SolveForB(coord, m):
    #         """
    #             Solves for b in y = mx + b, when given a coordinate and slope.
    #         """
    #         return coord[1] - (m * coord[0])
        


    def is_within(self, x, y):
        # First, check if it's even possible for the point to be within the bounds

        # If it's possible, then, based on the x 

        # Using shapely for implementation
        point = Point((x, y))
        return self.polygon.contains(point)

## Environment Class

class Environment:

    def __init__(self, grid, objects, shape):
        """
        
        grid is a list of two lists (horizontal & vertical lines) containing lists (each representing a line) that contain two tuples that specify the start & ends coordinates of their lines.
        """
        self.grid = self.GenerateGrid(grid)
        self.objects = objects
        self.shape = shape

    def GenerateGrid(self, lineCoords):
        """
            From a series of vertical & horizontal line coordinates (see Loading_data.txt), create a meshgrid to simulate the environment's grid.
        """
        # Split horizontal & vertical line coordinates (with each line being a list of two tuples representing start and ends points of the line)
        horizontalCoords, verticalCoords = lineCoords 

        # Flatten them into a list of coordinates
        horizontalCoords = list(chain(*horizontalCoords))
        verticalCoords = list(chain(*verticalCoords))

        # Combine all of the coordinates (non-duplicating)
        fullCoords = set(horizontalCoords).union(set(verticalCoords))
        
        # Initialize x-coordinates & y-coordinates of the grid
        xCoords = set(0)
        yCoords = set(0)

        # Grab all x & y coordinates that are used in the grid
        for x, y in fullCoords:
            xCoords.add(x)
            yCoords.add(y)

        # Create the grid
        xCoords = np.array(xCoords).sort()
        yCoords = np.array(yCoords).sort()
        grid = np.meshgrid(xCoords, yCoords)

        return grid


    def SpecimenLocation(self, x, y):
        """
            Given the x and y values of the specimen (assumed a rat), return which locale (specified by a mapping to LOCALE_MAPPING) it is currently present in.

            Currently only handles rectangular fields. Will add circular functionality later.
        """
        xv, yv = self.grid
        locale = 0

        for i in range(len(xv) - 1):
            for j in range(len(yv) - 1):
                xMin = xv[j + 1, i]
                yMin = yv[j + 1, i]
                xMax = xv[j, i + 1]
                yMax = yv[j, i + 1]

                # Biased towards the first locale the specimen could be in.
                ## Biased towards upper left-most locales
                ### If specimen is on boundary between two or more locales (VERY RARE; requires whole number), it will choose the upper left-most locale as the locale the specimen is in.
                if (x >= xMin and x <= xMax) and (y >= yMin and y <= yMax):
                    return LOCALE_MAPPING[locale]
                locale += 1
        raise Exception("Error: specimen was not located within any locale.")


                





# Specification of Environments
### Environments usually share the same grids + objects, but certain experiments use different grids and/or objects (and in one special case, a circular environment).

## Common Environment

COMMON_ENV = Environment(
    [
        [ # Horizontal Lines
            [(20, 20), (180, 20)],
            [(20, 40), (180, 40)],
            [(20, 80), (180, 80)],
            [(20, 120), (180, 120)],
            [(20, 160), (180, 160)],
            [[(20, 180), (180, 180)]]
        ],
        [ # Vertical Lines
            [(20, 20), (20, 180)],
            [(40, 20), (40, 180)],
            [(80, 20), (80, 180)],
            [(120, 20), (120, 180)],
            [(160, 20), (160, 180)],
            [(180, 20), (180, 180)],
        ]
    ],
    [ # List of objects
        Rectangle([(56, 136), (64, 144)]),
        Rectangle([(172, 172), (180, 180)]),
        Rectangle([(94.75, 55.75), (105.25, 64.25)]),
        Polygon([
            (174.343, 20),
            (180, 25.6569),
            (174.343, 31.3137),
            (168.686, 25.6569),
            (174.343, 20)
        ])
    ],
    'FillerShape'
)

## Q21 to Q23 Environments
Q20S_ENV = None

## Q17 Environment
Q17_ENV = None

