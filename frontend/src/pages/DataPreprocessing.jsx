import React, { useState, useEffect } from 'react';
import './DataPreprocessing.css';
import axios from 'axios';

const DataPreprocessing = () => {
  const [selectedDataFiles, setSelectedDataFiles] = useState([]);
  const [dataFiles, setDataFiles] = useState([]);
  const [preprocessedFiles, setPreprocessedFiles] = useState([]);
  const [determineKAutomatically, setDetermineKAutomatically] = useState(true); // State for "Determine k Automatically"
  const [parameters, setParameters] = useState({
    LOWESS: { deg: 2, half_window: 24, num_iter: 2 },
    RRM: { half_windows: [7, 5, 3, 3], min_arr: 12, tol: 1.3 },
    EM: {
      half_window: 4,
      log_transform: 'cbrt', // Default value for log_transform
      num_guesses: 5,
      num_iters: 200,
      significance: 0.05,
      max_k: 4,
      k: null, // Updated to match backend default
      segment_constrain: true,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchDataFiles = async () => {
      try {
        // Use the correct endpoint URL
        const response = await axios.get('http://localhost:8000/api/frdr-query/get-timeseries/?trials=32');
        const trials = response.data;
    
        // Assuming the response contains a dictionary of trial IDs and their metadata
        const trialList = Object.keys(trials).map((trialId) => ({
          id: trialId,
          metadata: trials[trialId], // Include any metadata associated with the trial
        }));
    
        setDataFiles(trialList); // Update the state with the list of trials
      } catch (error) {
        console.error('Error fetching trials:', error);
      }
    };

    fetchDataFiles();
  }, []);

  const handleParameterChange = (method, param, value) => {
    const metadata = parameterMetadata[method][param];
  
    // Special handling for `half_windows`
    if (param === 'half_windows') {
      // Allow intermediate input without validation
      setParameters((prev) => ({
        ...prev,
        [method]: { ...prev[method], [param]: value.split(',').map((item) => item.trim()) },
      }));
      return; // Skip validation during typing
    }
  
    // Enforce numeric ranges for other inputs
    if (metadata.type === 'int' || metadata.type === 'float') {
      const numericValue = metadata.type === 'int' ? parseInt(value, 10) : parseFloat(value);
  
      // Check if the value is within the allowed range
      if (metadata.range && Array.isArray(metadata.range)) {
        if (numericValue < metadata.range[0] || numericValue > metadata.range[1]) {
          return; // Ignore invalid input
        }
      } else if (metadata.range === '>= 1' && numericValue < 1) {
        return; // Ignore invalid input
      } else if (metadata.range === '> 0' && numericValue <= 0) {
        return; // Ignore invalid input
      }
  
      value = numericValue; // Update the value if valid
    }
  
    setParameters((prev) => ({
      ...prev,
      [method]: { ...prev[method], [param]: value },
    }));
  };
  
  const validateHalfWindows = (method, param) => {
    const list = parameters[method][param].map((item) => parseInt(item, 10));
  
    // Perform validation
    if (
      list.some((item) => isNaN(item) || item < 1 || item > 1000) || // All items must be in [1, 1000]
      list.some((item, index) => index < list.length - 1 && item < list[index + 1]) // Each item must be >= the next item (descending order)
    ) {
      alert('Invalid input for Half Window Widths. Ensure 1-8 items, each in [1, 1000], and sorted in descending order.');
      return false;
    }
  
    // Update the state with the validated list
    setParameters((prev) => ({
      ...prev,
      [method]: { ...prev[method], [param]: list },
    }));
    return true;
  };

  const handleDataFileToggle = (file) => {
    setSelectedDataFiles((prev) =>
      prev.includes(file) ? prev.filter((f) => f !== file) : [...prev, file]
    );
  };

  const handlePreprocess = async () => {
    setIsLoading(true); // Show the loading overlay
  
    // Create a deep copy of parameters to avoid mutating state
    const updatedParameters = JSON.parse(JSON.stringify(parameters));
  
    // Remove `k` from EM parameters if `determineKAutomatically` is true
    if (determineKAutomatically) {
      delete updatedParameters.EM.k;
    }
  
    const payload = {
      selectedTrials: selectedDataFiles.map((trial) => parseInt(trial, 10)), // Ensure trials are integers
      parameters: updatedParameters,
      determineKAutomatically,
    };
  
    console.log('Payload:', payload);
  
    try {
      const response = await axios.post(
        'http://localhost:8000/api/data-preprocessing/preprocess/',
        payload,
        { timeout: 1800000 } // Set timeout to 30 minutes (1800000 ms)
      );
      setPreprocessedFiles(response.data);
    } catch (error) {
      console.error('Error during preprocessing:', error);
    } finally {
      setIsLoading(false); // Hide the loading overlay
    }
  };

  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = `http://localhost:8000/api/data-preprocessing/download/${file}`;
    link.download = file;
    link.click();
  };

  // Algorithm titles for display
  const algorithmTitles = {
    LOWESS: 'Movement Smoothing (LOWESS)',
    RRM: 'Arrest Identification (RRM)',
    EM: 'Motion Segmentation (EM)',
  };

  // Mapping variable names to display names and value ranges
  const parameterMetadata = {
    LOWESS: {
      deg: { displayName: 'Polynomial Degree', type: 'int', range: [1, 6] },
      half_window: { displayName: 'Half Window Width', type: 'int', range: [1, 1000] },
      num_iter: { displayName: '# of Iterations', type: 'int', range: [1, 5] },
    },
    RRM: {
      half_windows: {
        displayName: 'Half Window Widths',
        type: 'list(int)',
        range: [1, 1000],
        constraints: '1-8 items, item k >= item k-1',
      },
      min_arr: { displayName: 'Min Arrest Width', type: 'int', range: [1, 1000] },
      tol: { displayName: 'Arrest Cut Off', type: 'float', range: [0, 100] },
    },
    EM: {
      half_window: { displayName: 'Half Window Width', type: 'int', range: [1, 1000] },
      log_transform: { displayName: 'Velocity Transformation', type: 'dropdown', range: null },
      num_guesses: { displayName: '# of Initial Guesses', type: 'int', range: '>= 1' },
      num_iters: { displayName: '# of Iterations', type: 'int', range: '>= 1' },
      significance: { displayName: 'Significance Level', type: 'float', range: [0, 1] },
      max_k: { displayName: 'Max Movement Modes', type: 'int', range: '>= 1' },
      k: { displayName: '# of Modes', type: 'int', range: '>= 1' },
      segment_constrain: { displayName: 'Binary Movement Modes', type: 'bool', range: 'True/False' },
    },
  };

  const tooltips = {
    LOWESS: {
      description: 'Rodent movement is smoothed to reduce noise and errors by fitting polynomials to short windows of movement data.',
      deg: 'The degree of the polynomial that will be fit to each window of data in order to smooth it.',
      half_window: 'The width of the window of data used to smooth each point. In frames (with sampling rate of 30 Hz).',
      num_iter: 'Number of iterations of the LOWESS algorithm.',
    },
    RRM: {
      description: 'Arrests (periods where the rodent is motionless) are identified and smoothed to remove noise.',
      half_windows: 'A list of shrinking half window widths to use for each subsequent iteration of the RRM algorithm. In frames (with sampling rate of 30 Hz).',
      min_arr: 'The minimum number of frames that the rodent must be motionless to qualify as an arrest. In frames (with sampling rate of 30 Hz).',
      tol: 'The movement tolerance under which a rodent can be considered motionless (in arrest). In cm.',
    },
    EM: {
      description: 'Rodent movement is segmented into periods of progression and lingering by modeling movement as a Gaussian mixture model.',
      half_window: 'The width of the window of data used to calculate approximate velocity around each point. In frames (with sampling rate of 30 Hz).',
      log_transform: 'Transformation function to be applied to maximum velocity estimate for each movement segment in order to improve model fitting.',
      num_guesses: 'Number of times the EM algorithm will be run with different initial guesses at the parameters of each mode of movement.',
      num_iters: 'Number of iterations of the EM algorithm per execution.',
      significance: 'The significance level at which improvements in model fitting by increasing the number of movement modes will be deemed statistically insignificant (not applicable if using fixed number of modes).',
      max_k: 'The maximum number of modes of movement that will be tested before the algorithm times out if the improvements do not converge (not applicable if using fixed number of modes).',
      k: 'The number of movement modes that will be used to model the rodent\'s motion (not applicable if using automatic number of modes).',
      segment_constrain: 'Label each data point as either progression (1) or lingering (0) rather than specific movement modes.',
    },
    determineKAutomatically: {
      displayName: 'Set # of Modes Automatically',
      description: 'Automatically determine the optimal number of modes to use in order to optimize model fitting.',
    },
  };

  return (
    <div className="data-preprocessing-page">
      <div className="top-section">
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
        <div className="preprocessing-methods">
          <h3>Preprocessing Methods</h3>
          <div className="method-item-container">
            {Object.keys(parameters).map((method) => (
              <div key={method} className="method-item">
                <h4>
                  <div className="tooltip-container">
                    <button className="info-button">i</button>
                    <span className="tooltip-text">
                      {tooltips[method].description || 'No description available.'}
                    </span>
                  </div>
                  {algorithmTitles[method]}
                </h4>
                {Object.keys(parameters[method]).map((param) => {
                  const metadata = parameterMetadata[method][param];
                  return (
                    <div key={param} className="parameter-item">
                      <div className="tooltip-container">
                        <button className="info-button">i</button>
                        <span className="tooltip-text">
                          {tooltips[method][param] || 'No description available.'}
                        </span>
                      </div>
                      <label>{metadata.displayName}:</label>
                      {param === 'half_windows' ? (
                        <input
                          type="text"
                          value={parameters[method][param].join(', ')}
                          onChange={(e) => handleParameterChange(method, param, e.target.value)} // Allow typing
                          onBlur={() => validateHalfWindows(method, param)} // Validate on blur
                          placeholder="Enter comma-separated values"
                        />
                      ) : metadata.type === 'dropdown' ? (
                        <select
                          value={parameters[method][param]}
                          onChange={(e) => handleParameterChange(method, param, e.target.value)}
                        >
                          <option value="cbrt">Cube Root</option>
                          <option value="log">Logarithm</option>
                          <option value="sqrt">Square Root</option>
                          <option value="log10">Log Base 10</option>
                          <option value="log2">Log Base 2</option>
                          <option value="log1p">Log(1 + x)</option>
                          <option value="None">None</option>
                        </select>
                      ) : (
                        <input
                          type={metadata.type === 'bool' ? 'checkbox' : 'number'}
                          value={parameters[method][param]}
                          checked={metadata.type === 'bool' ? parameters[method][param] : undefined}
                          disabled={
                            method === 'EM' &&
                            ((determineKAutomatically && param === 'k') ||
                              (!determineKAutomatically && (param === 'max_k' || param === 'significance')))
                          }
                          onChange={(e) =>
                            handleParameterChange(
                              method,
                              param,
                              metadata.type === 'bool' ? e.target.checked : e.target.value
                            )
                          }
                          min={metadata.range && Array.isArray(metadata.range) ? metadata.range[0] : undefined}
                          max={metadata.range && Array.isArray(metadata.range) ? metadata.range[1] : undefined}
                        />
                      )}
                    </div>
                  );
                })}
                {method === 'EM' && (
                  <div className="parameter-item">
                    <div className="tooltip-container">
                      <button className="info-button">i</button>
                      <span className="tooltip-text">
                        {tooltips.determineKAutomatically.description}
                      </span>
                    </div>
                    <label style={{ marginRight: '10px' }}>
                      {tooltips.determineKAutomatically.displayName}:
                    </label>
                    <input
                      type="checkbox"
                      checked={determineKAutomatically}
                      onChange={(e) => setDetermineKAutomatically(e.target.checked)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="data-selection">
          <h3>Available Trials</h3>
          <div className="data-items">
            {dataFiles.map((trial) => (
              <div key={trial.id} className="data-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedDataFiles.includes(trial.id)}
                    onChange={() => handleDataFileToggle(trial.id)}
                  />
                  Trial ID: {trial.id} {/* Display the trial ID */}
                </label>
              </div>
            ))}
          </div>
          <div className="data-selection-footer">
            <button onClick={handlePreprocess}>Preprocess</button>
          </div>
        </div>
      </div>

      <div className="results-section">
        <h3>Preprocessed Files</h3>
        <div className="result-items">
          {preprocessedFiles.map((file) => (
            <div key={file} className="result-item">
              <label>
                <input
                  type="checkbox"
                  onChange={(e) => console.log(`Checkbox for ${file} is ${e.target.checked ? 'checked' : 'unchecked'}`)}
                />
                {file}
              </label>
            </div>
          ))}
        </div>
        <div className="results-footer">
          <button onClick={() => preprocessedFiles.forEach((file) => handleDownload(file))}>
            Download Selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataPreprocessing;