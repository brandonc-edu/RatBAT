import React, { useState, useEffect } from 'react';
import './DataPreprocessing.css';
import axios from 'axios';

const DataPreprocessing = () => {
  const [selectedDataFiles, setSelectedDataFiles] = useState([]);
  const [dataFiles, setDataFiles] = useState([]);
  const [preprocessedFiles, setPreprocessedFiles] = useState([]);
  const [determineKAutomatically, setDetermineKAutomatically] = useState(false); // State for "Determine k Automatically"
  const [parameters, setParameters] = useState({
    LOWESS: { deg: 2, half_window: 24, num_iter: 2 },
    RRM: { half_windows: [7, 5, 3, 3], min_arr: 5, tol: 0.000001 },
    EM: {
      tol: 0.000001,
      half_window: 4,
      log_transform: 'cbrt', // Default value for log_transform
      num_guesses: 5,
      num_iters: 200,
      significance: 0.05,
      max_k: 4,
      k: 2,
      segment_constrain: true,
    },
  });

  useEffect(() => {
    const fetchDataFiles = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/data-preprocessing/data-files/');
        setDataFiles(response.data);
      } catch (error) {
        console.error('Error fetching data files:', error);
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
      selectedFiles: selectedDataFiles,
      parameters,
      determineKAutomatically, // Include the checkbox state in the payload
    };
    console.log('Payload:', payload); // Log the payload to verify its structure

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/data-preprocessing/preprocess/', payload);
      setPreprocessedFiles(response.data);
    } catch (error) {
      console.error('Error during preprocessing:', error);
    }
  };

  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = `http://127.0.0.1:8000/api/data-preprocessing/download/${file}`;
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
                  return (
                    <div key={param} className="parameter-item">
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
                    <label style={{ marginRight: '10px' }}>Determine k Automatically:</label>
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
          <h3>Data Files</h3>
          <div className="data-items">
            {dataFiles.map((file) => (
              <div key={file} className="data-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedDataFiles.includes(file)}
                    onChange={() => handleDataFileToggle(file)}
                  />
                  {file}
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