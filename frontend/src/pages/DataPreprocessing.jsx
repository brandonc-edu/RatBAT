import React, { useState, useEffect } from 'react';
import './DataPreprocessing.css';
import axios from 'axios';

const DataPreprocessing = () => {
  const [selectedMethods, setSelectedMethods] = useState([]);
  const [selectedDataFile, setSelectedDataFile] = useState('');
  const [selectedResults, setSelectedResults] = useState([]);
  const [dataFiles, setDataFiles] = useState([]);
  const preprocessingMethods = ['Method 1', 'Method 2'];
  const results = ['Result 1', 'Result 2'];

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

  const handleMethodToggle = (method) => {
    setSelectedMethods((prevSelected) =>
      prevSelected.includes(method)
        ? prevSelected.filter((item) => item !== method)
        : [...prevSelected, method]
    );
  };

  const handleDataFileChange = (event) => {
    setSelectedDataFile(event.target.value);
  };

  const handleResultToggle = (result) => {
    setSelectedResults((prevSelected) =>
      prevSelected.includes(result)
        ? prevSelected.filter((item) => item !== result)
        : [...prevSelected, result]
    );
  };

  const handleSelectAllResults = () => {
    setSelectedResults(results);
  };

  const handleApply = () => {
    if (!selectedDataFile) {
      alert('Please select a data file.');
      return;
    }

    alert('Apply button clicked. This is a static page.');
  };

  const handleDownloadSelected = () => {
    alert('Download button clicked. This is a static page.');
  };

  return (
    <div className="data-preprocessing-page">
      <div className="top-section">
        <div className="preprocessing-methods">
          <h3>Preprocessing Methods</h3>
          {preprocessingMethods.map((method, index) => (
            <div key={index} className="method-item">
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

        <div className="data-selection">
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

      <div className="results-section">
        <h3>Results</h3>
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
        <div className="results-footer">
          <button onClick={handleSelectAllResults}>Select All</button>
          <button onClick={handleDownloadSelected}>Download Selected</button>
        </div>
      </div>
    </div>
  );
};

export default DataPreprocessing;