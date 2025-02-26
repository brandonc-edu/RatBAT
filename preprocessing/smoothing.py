import pandas as pd
import numpy  as np

def lowess(data:pd.DataFrame, deg:int, half_window:int, num_iter:int) -> pd.DataFrame:
    """Locally Weighted Scatter Plot Smothing.
    An iterative algorithm used for general smoothing purposes.

    Parameters
    ----------
    data : pd.Dataframe
        The raw data for one trial to be smoothed.
    deg : int
        The degree of polynomial to be fitted to windows of data.
    half_window : int
        Half the width of a window of data.
        Each window has width: 2*half_window + 1
            
    Returns
    -------
    pandas.DataFrame
        Smoothed version of data.
    """

    

    
             

def repeated_running_medians(data:pd.DataFrame, half_windows:list[int], min_arr:int, tol:float) -> pd.DataFrame:
    """Repeated Running Medians Smoothing.
    An iterative algorithm used for identifying arrests (periods of zero movement).

    Parameters
    ----------
    data : pd.Dataframe
        The raw data for one trial to be smoothed.
    half_windows : list[int]
        A list of half-window lengths to be used by each iteration of the algorithm.
        For iteration i, each window has width: 2*half_windows[i] + 1 
    min_arr : int
        The minimum number of frames required for a segment to be classified an arrest.
        There must be at least min_arr frames in a row within tol of each other to register an arrest.
    tol : float
        The max distance between two points that will be considered equal for the sake of identifying arrests. 
    Returns
    -------
    pandas.DataFrame
        Data with smoothed arrests.
    """
