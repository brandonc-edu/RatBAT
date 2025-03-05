import pandas as pd
import numpy  as np

def lowess(data:np.ndarray, deg:int, half_window:int, num_iter:int) -> np.ndarray:
    """Locally Weighted Scatter Plot Smothing.
    An iterative algorithm used for general smoothing purposes.

    Based on: Hen I., Sakov A., Kafkafi N., Golani I., Benjamini Y.
              The dynamics of spatial behavior: how can robust smoothing techniques help?
              Journal of Neuroscience Methods 133 (2004) 161-172
    
    Parameters
    ----------
    data : numpy.ndarray
        nx1 array of raw x or y movement data.
    deg : int
        The degree of polynomial to be fitted to windows of data.
    half_window : int
        Half the width of a window of data.
        Each window has width: 2*half_window + 1
    num_iter : int 
        Number of iterations of polynomial fitting.
            
    Returns
    -------
    numpy.ndarray
        Smoothed version of data.
    """

    n = data.shape[0]
    hw = half_window

    # Initialize weight and smoothed data arrays:
    weights = np.zeros(shape=(n, 2 * hw + 1), dtype=float)
    data_s  = np.zeros(shape=(n, 1), dtype = float)
    
    # Matrix of relative sample_ids to be used for WLS to fit to 'deg' degree polynomial. 
    sids = np.vander(np.array([j for j in range(-hw, hw + 1)]).T, deg + 1)

    # For each point, define weights for all points within a half window of the point
    # these weights will be used to fit a polynomial to estimate a smoothed value for the point.
    for i in range(n):
        for j in range(max(0, i - hw), min(n, i + hw + 1)):
            weights[i, j-(i-hw)] = (1 - abs((i - j) / hw)**3)**3
    
    # Polynomial fitting is repeated over m.ultiple iterations based on desired path smoothness. 
    for _ in range(num_iter):
        # A 'deg' degree polynomial is fitted for every point in the dataset using weighted least squares.
        for i in range(n):

            w = weights[i] * np.identity(2 * hw + 1)
            coef = np.linalg.inv(sids.T * w * sids) * sids.T * w * data            
            print(coef)

        # Residuals are used to adjust weights.
        # Points with large residuals have decreased weights and vice versa. 
        residuals = np.abs(data - data_s)

        for i in range(n):
            
            med_residual = np.median(residuals[max(0, i - hw) : min(n, i + hw + 1)])
            
            for j in range(max(0, i - hw), min(n, i + hw + 1)):
     
                if residuals[j] > 6 * med_residual:
                    weights[i, j-(i-hw)] = 0
                else:
                    weights[i, j-(i-hw)] = (1 - residuals[j] / 6 * med_residual) * weights[i, j-(i-hw)]

    return data_s
        


""" 
        # Neighbourhoods for the first and last half window of coordinates
        # will have less entries, unused weights are initialized to 0. 
        nbhs[i] = np.concat((np.zeros(shape=(max(hw - i, 0), 2)), coords[max(0, i - hw) : min(n, i + hw + 1)], np.zeros(shape=(max(i - n + hw + 1, 0), 2))))
        """      

def repeated_running_medians(data:np.ndarray, half_windows:list[int], min_arr:int, tol:float) -> np.ndarray:
    """Repeated Running Medians Smoothing.
    An iterative algorithm used for identifying arrests (periods of zero movement).

    Based on: Hen I., Sakov A., Kafkafi N., Golani I., Benjamini Y.
              The dynamics of spatial behavior: how can robust smoothing techniques help?
              Journal of Neuroscience Methods 133 (2004) 161-172
    
    Parameters
    ----------
    data : numpy.ndarray
        nx1 array of raw x and y movement data.
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
    numpy.ndarray
        Data with smoothed arrests.
    """

df = pd.read_csv("database/data/test_data/Q23U693001_01_5_0001_0020179_TrackFile.csv")
df = df['x'].to_numpy(np.float64)
print(df)
print(lowess(df,3,2,2))
