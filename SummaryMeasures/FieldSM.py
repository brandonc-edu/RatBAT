"""FieldSM

This module contains all of the required functionality in regards to calculations based on the experiments' open field environment.


Authors: Brandon Carrasco
Created on: 07-11-2024
Modified on: 16-11-2024
"""

# Necessary Imports

# import pandas as pd
import numpy as np
from shapely.geometry import Point
from shapely.geometry import Polygon
from shapely.prepared import prep
from itertools import chain

# Constants

LOCALE_MAPPING = [70, 75, 80, 85, 10,
                  65, 7, 8, 1, 15,
                  60, 6, 0, 2, 20,
                  55, 5, 4, 3, 25,
                  50, 45, 40, 35, 30]

LOCALE_MAPPING_ALT = [50, 45, 40, 35, 30,
                      55, 5, 4, 3, 25,
                      60, 6, 0, 2, 20,
                      65, 7, 8, 1, 15,
                      70, 75, 80, 85, 10]

LOCALE_MAPPING_ALT_2 = [30, 35, 40, 45, 50,
                        25, 3, 4, 5, 55,
                        20, 2, 0, 6, 60,
                        15, 1, 8, 7, 65,
                        10, 85, 80, 75, 70]

LOCALE_MAPPING_ALT_3 = [10, 75, 80, 85, 10,
                        15, 1, 8, 7, 65,
                        20, 2, 0, 6, 60,
                        25, 3, 4, 5, 55,
                        10, 85, 80, 75, 70]


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

class PolygonObject(PhysicalObject):

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
        xCoords = set()
        yCoords = set()

        # Grab all x & y coordinates that are used in the grid
        for x, y in fullCoords:
            # print(x)
            xCoords.add(x)
            yCoords.add(y)

        # Create the grid
        xCoords = np.sort(np.array(list(xCoords)))
        yCoords = np.sort(np.array(list(yCoords)))
        grid = np.meshgrid(xCoords, yCoords)

        return grid


    def SpecimenLocation(self, x, y, index=False):
        """
            Given the x and y values of the specimen (assumed a rat), return which locale (specified by a mapping to LOCALE_MAPPING) it is currently present in.

            NOTE: X & Y data never goes below 20.

            index specifies if the function returns the locale that the specimen is located in or the index of the locale the specimen is located in with respect to LOCALE_MAPPING.

            Currently only handles rectangular fields. Will add circular functionality later.
        """
        xv, yv = self.grid
        locale = 0

        for i in range(len(yv) - 1, 0, -1):
            for j in range(len(xv) - 1):
                xLower = xv[i, j]
                yLower = yv[i - 1, j]
                xUpper = xv[i, j + 1]
                yUpper = yv[i, j]

                # Biased towards the first locale the specimen could be in.
                ## Biased towards upper left-most locales
                ### If specimen is on boundary between two or more locales (VERY RARE; requires whole number), it will choose the upper left-most locale as the locale the specimen is in.
                if (x >= xLower and x <= xUpper) and (y >= yLower and y <= yUpper):
                    if not index:
                        return LOCALE_MAPPING[locale]
                    else:
                        return locale
                locale += 1
        print(f"Specimen coordinates: x={x}, y={y}")
        raise Exception("Error: specimen was not located within any locale.")
      


### Helper Functions

def GetLocaleFromIndex(index):
    """
        Given an index, return the locale that the index maps to in LOCALE_MAPPING.
    """
    return LOCALE_MAPPING[index]

def GetIndexFromLocale(locale):
    """
        Given a locale, return the index that locale belongs to in LOCALE_MAPPING.
    """
    return LOCALE_MAPPING.index(locale)




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
            [(20, 180), (180, 180)]
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
        PolygonObject([
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

# TESTING
print(COMMON_ENV.grid)
increases = [21, 41, 81, 121, 161]
for y in range(5):
    print(f"Row {y}")
    for x in range(5):
        # print(f"Column {y}")
        print(f"Index: {COMMON_ENV.SpecimenLocation(increases[x], increases[y], index=True)}, EW Locale: {COMMON_ENV.SpecimenLocation(increases[x], increases[y])}, coords: ({increases[x]}, {increases[y]})")