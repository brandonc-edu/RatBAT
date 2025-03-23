import React, { useState, useEffect } from 'react';
import './DataPreprocessing.css';
import axios from 'axios';

const DataPreprocessing = () => {
  const [selectedDataFiles, setSelectedDataFiles] = useState([]);
  const [dataFiles, setDataFiles] = useState([]);
  const [preprocessedFiles, setPreprocessedFiles] = useState([]);
  const [parameters, setParameters] = useState({
    LOWESS: { deg: 2, half_window: 24, num_iter: 2 },
    RRM: { half_windows: [7, 5, 3, 3], min_arr: 5, tol: 0.000001 },
    EM: {
      tol: 0.000001,
      half_window: 4,
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
    setParameters((prev) => ({
      ...prev,
      [method]: { ...prev[method], [param]: value },
    }));
  };

  const handleBooleanParameterChange = (method, param, value) => {
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

  return (
    <div className="data-preprocessing-page">
      <div className="top-section">
        <div className="preprocessing-methods">
          <h3>Preprocessing Methods</h3>
          <div className="method-item-container">
            {Object.keys(parameters).map((method) => (
              <div key={method} className="method-item">
                <h4>{method}</h4>
                {Object.keys(parameters[method]).map((param) => (
                  <div key={param} className="parameter-item">
                    <label>{param}:</label>
                    {typeof parameters[method][param] === 'boolean' ? (
                      <input
                        type="checkbox"
                        checked={parameters[method][param]}
                        onChange={(e) =>
                          handleBooleanParameterChange(method, param, e.target.checked)
                        }
                      />
                    ) : (
                      <input
                        type="text"
                        value={parameters[method][param]}
                        onChange={(e) => handleParameterChange(method, param, e.target.value)}
                      />
                    )}
                  </div>
                ))}
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