import React, { useState, useEffect } from 'react';
import './ComputeSummaryMeasures.css';
import axios from 'axios';

const ComputeSummaryMeasures = () => {
  const [results, setResults] = useState([]);
  const [selectedSummaryMeasures, setSelectedSummaryMeasures] = useState([]);
  const [dataFiles, setDataFiles] = useState([]);
  const [selectedDataFile, setSelectedDataFile] = useState('');
  const [selectedResults, setSelectedResults] = useState([]);
  const [summaryMeasuresOptions, setSummaryMeasuresOptions] = useState([]);

  useEffect(() => {
    // Fetch available data files from the backend
    const fetchDataFiles = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/data-files/');
        console.log("Fetched data files:", response.data); // Debugging statement
        setDataFiles(response.data);
      } catch (error) {
        console.error("Error fetching data files:", error);
      }
    };

    // Fetch summary measures options from the backend
    const fetchSummaryMeasures = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/summary-measures/');
        console.log("Fetched summary measures:", response.data); // Debugging statement
        setSummaryMeasuresOptions(response.data);
      } catch (error) {
        console.error("Error fetching summary measures:", error);
      }
    };

    fetchDataFiles();
    fetchSummaryMeasures();
  }, []);

  const handleSummaryMeasureToggle = (measure) => {
    setSelectedSummaryMeasures(prevSelected =>
      prevSelected.includes(measure)
        ? prevSelected.filter(item => item !== measure)
        : [...prevSelected, measure]
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

  const handleApply = async () => {
    if (!selectedDataFile) {
      alert("Please select a data file.");
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/compute-summary-measures/', {
        data_file_path: selectedDataFile,
        summary_measures: selectedSummaryMeasures,
        environment: 'common', // or 'q20s' / 'q17'
      });

      console.log("Results:", response.data);
      setResults(formatResults(response.data));
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
    }
  };

  const formatResults = (data) => {
    const formattedResults = [];
    for (const [key, value] of Object.entries(data)) {
      if (key === "calc_homebases") {
        formattedResults.push(`Homebases: Main - ${value.main_home_base}, Secondary - ${value.secondary_home_base}`);
      } else if (key === "calc_HB1_cumulativeReturn") {
        formattedResults.push(`Cumulative Return: ${value}`);
      } else if (key === "calc_HB1_meanDurationStops") {
        formattedResults.push(`Mean Duration Stops: ${value}`);
      } else if (key === "calc_HB1_meanReturn") {
        formattedResults.push(`Mean Return: ${value}`);
      } else if (key === "calc_HB1_meanExcursionStops") {
        formattedResults.push(`Mean Excursion Stops: ${value}`);
      } else {
        formattedResults.push(`${key}: ${value}`);
      }
    }
    return formattedResults;
  };

  const handleDownloadSelected = () => {
    console.log("Downloading selected results...");
    // Implement download functionality here
  };

  const capitalizeFirstLetter = (string) => {
    return string.replace(/\b\w/g, char => char.toUpperCase());
  };

  return (
    <div className="compute-summary-measures">
      <div className="top-section">
        <div className="summary-measures">
          <h3>Summary Measures</h3>
          {summaryMeasuresOptions.map((measure, index) => (
            <div key={index} className="measure-item">
              <label>
                <input
                  type="checkbox"
                  checked={selectedSummaryMeasures.includes(measure)}
                  onChange={() => handleSummaryMeasureToggle(measure)}
                />
                {capitalizeFirstLetter(measure.replace('calc_', '').replace(/_/g, ' '))}
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

export default ComputeSummaryMeasures;