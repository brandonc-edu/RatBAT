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
      tol: 0.000001,
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

  useEffect(() => {
    const fetchDataFiles = async () => {
      try {
        // Use the correct endpoint URL
        const response = await axios.get('http://ratbat.cas.mcmaster.ca/api/get-timeseries/');
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
      const list = value.split(',').map((item) => parseInt(item.trim(), 10));
  
      // Validate the list
      if (
        list.length < 1 || // Must have at least 1 item
        list.length > 8 || // Must have at most 8 items
        list.some((item) => isNaN(item) || item < 1 || item > 1000) || // All items must be in [1, 1000]
        list.some((item, index) => index < list.length - 1 && item < list[index + 1]) // Each item must be >= the next item
      ) {
        alert('Invalid input for Half Window Widths. Ensure 1-8 items, each in [1, 1000], and sorted in descending order.');
        return;
      }
  
      setParameters((prev) => ({
        ...prev,
        [method]: { ...prev[method], [param]: list },
      }));
      return;
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

  const handleDataFileToggle = (file) => {
    setSelectedDataFiles((prev) =>
      prev.includes(file) ? prev.filter((f) => f !== file) : [...prev, file]
    );
  };

  const handlePreprocess = async () => {
    const payload = {
      selectedTrials: selectedDataFiles, // Use selected trials instead of files
      parameters,
      determineKAutomatically,
    };
  
    console.log('Payload:', payload); // Log the payload for debugging
  
    try {
      const response = await axios.post('/api/data-preprocessing/preprocess/', payload);
      setPreprocessedFiles(response.data);
    } catch (error) {
      console.error('Error during preprocessing:', error);
    }
  };

  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = `http://ratbat.cas.mcmaster.ca/api/data-preprocessing/download/${file}`;
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
      tol: { displayName: 'Arrest Cut Off', type: 'float', range: '> 0' },
      half_window: { displayName: 'Half Window Width', type: 'int', range: [1, 1000] },
      log_transform: { displayName: 'Velocity Transformation', type: 'dropdown', range: null },
      num_guesses: { displayName: '# of Initial Guesses', type: 'int', range: '>= 1' },
      num_iters: { displayName: '# of Iterations', type: 'int', range: '>= 1' },
      significance: { displayName: 'Significance Level', type: 'float', range: [0, 1] },
      max_k: { displayName: 'Max Movement Modes', type: 'int', range: '>= 1' },
      k: { displayName: '# of Modes', type: 'int', range: '>= 1' },
      segment_constrain: { displayName: 'Binary Movement Modes', type: 'bool', range: 'True/False' },
      determine_k_automatically: { displayName: 'Set # of Modes Automatically', type: 'bool', range: 'True/False' },
    },
  };
  
  const parameterDefinitions = {
    LOWESS: {
      deg: 'The degree of the polynomial that will be fit to each window of data in order to smooth it.',
      half_window: 'The width of the window of data used to smooth each point.',
      num_iter: 'Number of iterations of the LOWESS algorithm.',
    },
    RRM: {
      half_windows: 'A list of shrinking half window widths to use for each subsequent iteration of the RRM algorithm.',
      min_arr: 'The minimum number of frames that the rodent must be motionless to qualify as an arrest.',
      tol: 'The movement tolerance under which a rodent can be considered motionless (in arrest).',
    },
    EM: {
      tol: 'The movement tolerance under which a rodent can be considered motionless (in arrest).',
      half_window: 'The width of the window of data used to calculate approximate velocity around each point.',
      log_transform: 'Transformation function to be applied to maximum velocity estimate for each movement segment.',
      num_guesses: 'Number of times the EM algorithm will be run with different initial guesses.',
      num_iters: 'Number of iterations of the EM algorithm per execution.',
      significance: 'The significance level at which improvements in model fitting will be deemed insignificant.',
      max_k: 'The maximum number of modes of movement that will be tested.',
      k: 'The number of movement modes that will be used to model the rodent\'s motion.',
      segment_constrain: 'Label each data point as either progression (1) or lingering (0).',
      determine_k_automatically: 'Automatically determine the optimal number of modes to use in order to optimize model fitting.',
    },
  };

  return (
    <div className="data-preprocessing-page">
      <div className="top-section">
        <div className="preprocessing-methods">
          <h3>Preprocessing Methods</h3>
          <div className="method-item-container">
            {Object.keys(parameters).map((method) => (
              <div key={method} className="method-item">
                <h4>{algorithmTitles[method]}</h4>
                {Object.keys(parameters[method]).map((param) => {
                  const metadata = parameterMetadata[method][param];
                  const definition = parameterDefinitions[method]?.[param] || 'No definition available.';
                  return (
                    <div key={param} className="parameter-item">
                      <div className="tooltip-container">
                        <button className="info-button">i</button>
                        <span className="tooltip-text">{definition}</span>
                      </div>
                      <label>{metadata.displayName}:</label>
                      {param === 'half_windows' ? (
                        <input
                          type="text"
                          value={parameters[method][param].join(', ')}
                          onChange={(e) => handleParameterChange(method, param, e.target.value)}
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
                        {parameterDefinitions.EM.determine_k_automatically}
                      </span>
                    </div>
                    <label style={{ marginRight: '10px' }}>
                      {parameterMetadata.EM.determine_k_automatically.displayName}:
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