// src/pages/DataPreprocessing.jsx
<<<<<<< HEAD
import React, { useState } from 'react';
import './DataPreprocessing.css';

const DataPreprocessing = () => {
  const [selectedMethods, setSelectedMethods] = useState([]);
  const [selectedDataFile, setSelectedDataFile] = useState('');
  const [selectedResults, setSelectedResults] = useState([]);

  const dataFiles = ['Loaded Data 1', 'Loaded Data 2'];
  const preprocessingMethods = ['Method 1', 'Method 2'];
  const results = ['...................', '.......................'];

  const handleMethodToggle = (method) => {
    setSelectedMethods(prevSelected =>
      prevSelected.includes(method)
        ? prevSelected.filter(item => item !== method)
        : [...prevSelected, method]
    );
  };

  const handleDataFileChange = (event) => {
    setSelectedDataFile(event.target.value);
  };

  const handleResultToggle = (result) => {
    setSelectedResults(prevSelected =>
      prevSelected.includes(result)
        ? prevSelected.filter(item => item !== result)
        : [...prevSelected, result]
    );
  };

  const handleSelectAllResults = () => {
    setSelectedResults(results);
  };

  const handleApply = () => {
    if (!selectedDataFile) {
      alert("Please select a data file.");
      return;
    }

    alert("Apply button clicked. This is a static page.");
  };

  const handleDownloadSelected = () => {
    alert("Download button clicked. This is a static page.");
  };

  return (
    <div className="compute-summary-measures">
      <div className="top-section">
        <div className="summary-measures">
          <h3>Preprocessing Methods</h3>
          {preprocessingMethods.map((method, index) => (
            <div key={index} className="measure-item">
              <label>
                <input
                  type="checkbox"
                  checked={selectedMethods.includes(method)}
                  onChange={() => handleMethodToggle(method)}
                />
                {method}
              </label>
            </div>
          ))}
        </div>

        <div className="selected-data">
          <h3>Data File</h3>
          <div className="data-items">
            {dataFiles.map((file, index) => (
              <div key={index} className="data-item">
                <label>
                  <input
                    type="radio"
                    name="dataFile"
                    value={file}
                    checked={selectedDataFile === file}
                    onChange={handleDataFileChange}
                  />
                  {file}
                </label>
              </div>
            ))}
          </div>
          <div className="data-footer">
            <button onClick={handleApply}>Apply</button>
          </div>
        </div>
      </div>

      <div className="result-section">
        <h3>Result</h3>
        <div className="result-items">
          {results.map((result, index) => (
            <div key={index} className="result-item">
              <label>
                <input
                  type="checkbox"
                  checked={selectedResults.includes(result)}
                  onChange={() => handleResultToggle(result)}
                />
                {result}
              </label>
            </div>
          ))}
        </div>
        <div className="result-footer">
          <button onClick={handleSelectAllResults}>Select All</button>
          <button onClick={handleDownloadSelected}>Download Selected</button>
        </div>
      </div>
    </div>
  );
};
=======
import React from 'react';

const DataPreprocessing = () => (
    <div>
        src/pages/DataPreprocessing.jsx
    </div>
);
>>>>>>> FRDRQuery

export default DataPreprocessing;