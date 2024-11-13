import React, { useState } from 'react';
import './ComputeSummaryMeasures.css';

const ComputeSummaryMeasures = () => {
  const summaryMeasuresOptions = ["Summary Measure 1", "Summary Measure 2", "Summary Measure 3", "Summary Measure 4", "Summary Measure 5", "Summary Measure 6", "Summary Measure 7", "Summary Measure 8", "Summary Measure 9", "Summary Measure 10", "Summary Measure 11", "Summary Measure 12"];
  const dataOptions = ["Processed Data 1", "Processed Data 2"];
  const [results] = useState(["..................................", "..................................."]);

  const [selectedSummaryMeasures, setSelectedSummaryMeasures] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [selectedResults, setSelectedResults] = useState([]);

  const handleSummaryMeasureToggle = (measure) => {
    setSelectedSummaryMeasures(prevSelected =>
      prevSelected.includes(measure)
        ? prevSelected.filter(item => item !== measure)
        : [...prevSelected, measure]
    );
  };

  const handleDataToggle = (data) => {
    setSelectedData(prevSelected =>
      prevSelected.includes(data)
        ? prevSelected.filter(item => item !== data)
        : [...prevSelected, data]
    );
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
    console.log("Applying summary measures...");
  };

  const handleDownloadSelected = () => {
    console.log("Downloading selected results...");
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
                {measure}
              </label>
            </div>
          ))}
        </div>

        <div className="selected-data">
          <h3>Selected Data</h3>
          
          {/* Scrollable list of data items */}
          <div className="data-items">
            {dataOptions.map((data, index) => (
              <div key={index} className="data-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedData.includes(data)}
                    onChange={() => handleDataToggle(data)}
                  />
                  {data}
                </label>
              </div>
            ))}
          </div>

          {/* Footer section for the Apply button */}
          <div className="data-footer">
            <button onClick={handleApply}>Apply</button>
          </div>
        </div>
      </div>

      <div className="result-section">
        <h3>Result</h3>
        
        {/* Scrollable result items container */}
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

        {/* Fixed footer for the buttons */}
        <div className="result-footer">
          <button onClick={handleSelectAllResults}>Select All</button>
          <button onClick={handleDownloadSelected}>Download Selected</button>
        </div>
      </div>
    </div>
  );
};

export default ComputeSummaryMeasures;
