import numpy as np
import random
import scipy.stats as stats


# Indices for parameters within parameter matrices.
MEAN = 0 # Mean
SD   = 1 # Standard deviation
PROP = 2 # Proportion

def segment_path(data, tol, half_width, log_transform, num_guesses, num_iters, significance, k = None):
    """Path segmentation algorithm to categorize smoothed time-series data into segments of lingering and progression.

    Based on: Drai D., Benjamini Y., Golani I.
              Statistical discrimination of natural modes of motion in rat exploratory behavior
              Journal of Neuroscience Methods 96 (2000) 119-131
    
    Parameters
    ----------
    data : numpy.ndarray
        array of log modified max standard deviations for each segment.
    num_guesses : int
        Number of times EM will be run using different initial guesses.   
    num_iters : int
        Number of iterations for the underlying EM algorithm for each initial guess. 
    significance : float
        Alpha value used for a chi squared test to determine the convergence of likelihood improvements.
        If using set number of gaussian movement clusters (k), value is ignored
    k : int
        Number of movement modes (gaussians) in the gaussian mixture model (GMM).
        For automatic calculation of the optimal k value, use k = None 
        Defaults to None

    Returns
    -------
    numpy.ndarray
        Classified segments.
    """

    # initializing variables
    n = data.shape[0]
    sd = np.zeros(n)
    hw = half_width
    arrests = []
    segments = []

    # Calculate standard deviation for windows centered around each data point.
    for i in range(n):
        sd[i] = sd_move(data[max(0, i - hw) : min(n, i + hw + 1)])
        # Movement segments are separated by arrests (windows with SD < tol)
        if sd[i] < tol: arrests.append(i)
    
    # Define segments as intervals between arrests:
    for i in range(len(arrests)):
        if i + 1 < n and arrests[i+1] - arrests[i] > 1:
            segments.append([arrests[i] + 1,arrests[i+1] - 1])
    if arrests[-1] < n-1:
        segments.append([arrests[i] + 1, n-1])
   
    segments = np.array(segments)
    m = segments.shape[0]

    # For each segment we track the maximum standard deviation of all points transformed by a given log function. 
    max_sd = np.zeros(m)

    for i in range(m):
        max_sd[i] = log_transform(max(sd[segments[i,0] : segments[i,1] + 1]))

    # Run EM either with fixed number of gaussians or automatic calculation of optimal value.
    if k == None:
        params, log_likelihood = em_full_auto(max_sd, num_guesses, num_iters, significance)
    else:
        params, log_likelihood = em_auto(max_sd, k, num_guesses, num_iters)
    
    k = params.shape[0]

    # Using EM generated parameters, determine the threshold values that separate modes of movement.
    threshold = np.zeros(k-1)
    mode = 0

    for sd in np.sort(max_sd):
        if gauss_pdf(sd, params[mode,MEAN], params[mode,SD]) < gauss_pdf(sd, params[mode,MEAN], params[mode,SD]):
            threshold[mode] = sd
            mode += 1
        if mode >= k-1:
            break

    if mode < k-1:
        raise ValueError("Invalid distribution")
    
    # Attribute a mode to each segment according to its log_MaxSD value
    seg_modes = np.zeros(shape = (m,1))

    for i in range(m):
        for j in range(k):
            if j == k-1:
                seg_modes[i] = k-1
                break
            elif max_sd < threshold[j]:
                seg_modes[i] = j 
                break
    
    return np.append(segments, seg_modes, axis = 1)

def sd_move(window:np.ndarray):
    """Auxiliary function for path segmentation which calculates the
    standard deviation of data points from their mean within a window of time.

    Parameters
    ----------
    window : numpy.ndarray
        n x 2 array containing x,y coordinates over a short window of time.
    Returns
    -------
    numpy.ndarray
        SD of distances from the mean point in the window.
    """
    n = window.shape[0]
    mean = np.mean(window,axis=0)
    dist = 0
    
    for point in window:
        dist += np.sum((point - mean)**2)
    
    return np.sqrt(dist/(n-1))

def em(data:np.ndarray, k:int, init_guesses:np.ndarray, num_iters:int):
    """Base expectation maximization algorithm using user provided initial guesses.

    Parameters
    ----------
    data : numpy.ndarray
        array of log modified max standard deviations for each segment.
    k : int
        Number of movement types (gaussians) in the gaussian mixture model (GMM).
    init_guesses : numpy.ndarray
        (k x 3) array of initial guesses for mean, SD, and proportion for each gaussian. 
    num_iters : int
        Number of algorithm iterations. 
    Returns
    -------
    numpy.ndarray
        (k x 3) array of estimated parameters.
    float
        final log likelihood.
    """

    params = init_guesses
    n = data.shape[0]
    gamma = np.zeros(n,k)
    

    for _ in range(num_iters):
        # Expectation step:
        for i in range(n):
            for j in range(k-1):
                # Use Bayes theorem to compute the likelyhood that data point i belongs to gaussian j:
                gamma[i,j] = ((params[j,PROP] * gauss_pdf(data[i], params[j,MEAN], params[j,SD])) /
                               np.sum([params[z,PROP] * gauss_pdf(data[i], params[z,MEAN], params[z,SD]) for z in range(k)]))

            # gamma (responsibility of each gaussian) values must sum to 1 for each data point. 
            gamma[i,k-1] = 1 - np.sum(gamma[i,:k-1])

        # Maximization step:
        for j in range(k):
            # For each gaussian update mean, SD, and proportions based on expected responsibilities
            resp = np.sum(gamma[:,j])
            params[j,MEAN] = np.sum([gamma[i,j] * data[i] for i in range(n)]) / resp
            params[j,SD]   = np.sum([gamma[i,j] * (data[i] - params[j,MEAN])**2 for i in range(n)]) / resp
            params[j,PROP] = resp / n
 
    # The log likelihood of the dataset given the parameters estimated is an indicator for
    # how well the gaussian mixture model represents the dataset.
    log_likelihood = np.sum([np.log(np.sum([
        params[j,PROP] * gauss_pdf(data[i], params[j,MEAN], params[j,SD]) 
        for j in range(k)])) for i in range(n)])

    return params, log_likelihood

def em_auto(data:np.ndarray, k:int, num_guesses:int, num_iters:int):
    """Partial automation function for expectation maximization.
    Tests EM for different initial guesses and returns the one with the highest log likelihood. 

    Parameters
    ----------
    data : numpy.ndarray
        array of log modified max standard deviations for each segment.
    k : int
        Number of movement types (gaussians) in the gaussian mixture model (GMM).
    num_guesses : int
        Number of times EM will be run using different initial guesses.   
    num_iters : int
        Number of iterations for the underlying EM algorithm for each initial guess. 
    
    Returns
    -------
    numpy.ndarray
        (k x 3) array of estimated parameters from the best EM iteration.
    float
        final log likelihood of the best EM iteration.
    """

    n = data.shape[0]
    opt_params = None
    opt_likelihood = 0

    for _ in range(num_guesses):
        params = np.zeros(shape = (k,3))
        
        # Generate a random set of proportions for the GMM such that the sum(props) = 1.
        rand_props = [random.random() for _ in range(k)]
        prop_sum = np.sum(rand_props)
        params[:,PROP] = [(p / prop_sum) for p in rand_props]

        # Calculate mean/sd for each gaussian by taking the mean/sd
        # of that gaussian's proportion of the sorted dataset.
        sorted_data = np.sort(data)
        start = 0

        for j in range(k):
            end = max(start + int(params[j,PROP] * n), n)

            params[j,MEAN] = np.mean(sorted_data[start : end])
            params[j,SD]   = np.std(sorted_data[start : end])

            start = end

        # Run EM with generated parameters.
        params, log_likelihood = em(data, k, params, num_iters)

        # If EM produces a better likelihood than all previous iterations, update optimal parameters.
        if log_likelihood > opt_likelihood: 
            opt_params, opt_likelihood = params.copy(), log_likelihood
    
    return opt_params, opt_likelihood

def em_full_auto(data:np.ndarray, num_guesses:int, num_iters:int, significance:float):
    """Fully automated version of EM algorithm. 
    Tests em_auto for increasing numbers of gaussians (k) until a requested likelihood is reached. 

    Parameters
    ----------
    data : numpy.ndarray
        array of log modified max standard deviations for each segment.
    num_guesses : int
        Number of times EM will be run using different initial guesses.   
    num_iters : int
        Number of iterations for the underlying EM algorithm for each initial guess. 
    significance : float
        Alpha value used for a chi squared test to determine the convergence of likelihood improvements.
    
    Returns
    -------
    numpy.ndarray
        (k x 3) array of estimated parameters from the best EM iteration.
    float
        final log likelihood of the best EM iteration.
    """
    
    k = 2
    prev_likelihood = 0

    # Test on increasing numbers of gaussians until little improvment is seen.
    while True:
        params, log_likelihood = em_auto(data, k, num_guesses, num_iters)

        # Use log likelihood test to determine whether improvements from
        # increasing k are statistically significant.
        if stats.chi2.cdf(log_likelihood - prev_likelihood, 2) < significance:
            return params, log_likelihood
        
        k += 1
        prev_likelihood = log_likelihood

def gauss_pdf(x:float, mean:float, sd:float):
    # pdf for gaussian distribution.
    return (1 / np.sqrt(2 * np.pi * sd)) * np.exp(-(x - mean)**2 / (2 * sd))

a = [[1,2],
     [3,4],
     [5,6]]

a = np.array(a)
print(sd_move(a))

print(gauss_pdf(50,50,5))