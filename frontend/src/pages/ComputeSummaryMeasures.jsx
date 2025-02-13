import React, { useState, useEffect, useRef } from 'react';
import './ComputeSummaryMeasures.css';
import axios from 'axios';

const ComputeSummaryMeasures = () => {
  const [results, setResults] = useState([]);
  const [selectedSummaryMeasures, setSelectedSummaryMeasures] = useState([]);
  const [dataFiles, setDataFiles] = useState([]);
  const [selectedDataFiles, setSelectedDataFiles] = useState([]);
  const [selectedResults, setSelectedResults] = useState([]);
  const [summaryMeasuresOptions, setSummaryMeasuresOptions] = useState([]);
  const [showModal, setShowModal] = useState(true); // State to control the modal visibility
  const modalRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });

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

  const handleSelectAllSummaryMeasures = () => {
    if (selectedSummaryMeasures.length === summaryMeasuresOptions.length) {
      setSelectedSummaryMeasures([]);
    } else {
      setSelectedSummaryMeasures(summaryMeasuresOptions);
    }
  };

  const handleDataFileChange = (event) => {
    const value = event.target.value;
    setSelectedDataFiles(prevSelected =>
      prevSelected.includes(value)
        ? prevSelected.filter(item => item !== value)
        : [...prevSelected, value]
    );
  };

  const handleSelectAllDataFiles = () => {
    if (selectedDataFiles.length === dataFiles.length) {
      setSelectedDataFiles([]);
    } else {
      setSelectedDataFiles(dataFiles);
    }
  };

  const handleResultToggle = (file) => {
    setSelectedResults(prevSelected =>
      prevSelected.includes(file)
        ? prevSelected.filter(item => item !== file)
        : [...prevSelected, file]
    );
  };

  const handleSelectAllResults = () => {
    if (selectedResults.length === results.length) {
      setSelectedResults([]);
    } else {
      setSelectedResults(results.map(result => result.file));
    }
  };
  
  const handleDownloadSelected = () => {
    const selectedData = results.filter(result => selectedResults.includes(result.file));
    const groupedResults = groupResultsByFile(selectedData);

    const csvContent = "data:text/csv;charset=utf-8,"
      + Object.entries(groupedResults).map(([file, measures]) => (
        `${file}\nMeasure,Value\n` + measures.map((measure, measureIndex) => {
          if (measure.measure === 'Homebases') {
            const values = measure.value.split(', ');
            return values.map((value, valueIndex) => (
              `${valueIndex === 0 ? 'Homebases (KPname01)' : 'Homebases (KPname02)'},${value}`
            )).join('\n');
          } else if (measure.measure === 'Mean Duration Stops') {
            const values = measure.value.split(', ');
            return values.map((value, valueIndex) => (
              `${valueIndex === 0 ? 'Mean Duration Stops (KPmeanStayTime01_s)' : 'Mean Duration Stops (KPmeanStayTime01_s_log)'},${value}`
            )).join('\n');
          } else {
            return `${measure.measure},${measure.value}`;
          }
        }).join('\n')
      )).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "selected_results.csv");
    document.body.appendChild(link); // Required for Firefox

    link.click();
    document.body.removeChild(link);
  };

  const handleApply = async () => {
    if (selectedDataFiles.length === 0) {
      alert("Please select at least one data file.");
      return;
    }
  
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/compute-summary-measures/', {
        data_file_paths: selectedDataFiles,
        summary_measures: selectedSummaryMeasures,
        environment: 'common', // or 'q20s' / 'q17'
      });
  
      console.log("Results:", response.data);
      setResults(formatResults(response.data));
      setSelectedResults([]); // Reset selected results after applying
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
    }
  };

  const measureDisplayNames = {
    calc_homebases: 'Homebases',
    calc_HB1_cumulativeReturn: 'Cumulative Return',
    calc_HB1_meanDurationStops: 'Mean Duration Stops',
    calc_HB1_meanReturn: 'Mean Return',
    calc_HB1_meanExcursionStops: 'Mean Excursion Stops',
  };

  const measureTooltips = {
    calc_homebases: 'KPname',
    calc_HB1_cumulativeReturn: 'KPcumReturnfreq01',
    calc_HB1_meanDurationStops: 'KPmeanStayTime01',
    calc_HB1_meanReturn: 'KPcumReturnfreq01',
    calc_HB1_meanExcursionStops: 'KPstopsToReturn01',
  };

  const formatResults = (data) => {
    const formattedResults = [];
    for (const [file, measures] of Object.entries(data)) {
      for (const [key, value] of Object.entries(measures)) {
        if (!selectedSummaryMeasures.includes(key)) {
          continue; // Skip measures that are not selected
        }
        let displayValue;
        if (key === "calc_homebases") {
          if (Array.isArray(value) && value.length === 2) {
            displayValue = `${value[0]}, ${value[1]}`;
          } else {
            displayValue = 'Main - N/A, Secondary - N/A';
          }
        } else if (key === "calc_HB1_meanDurationStops" && Array.isArray(value)) {
          displayValue = value.join(', ');
        } else {
          displayValue = value;
        }
        formattedResults.push({
          file,
          measure: measureDisplayNames[key] || key,
          value: displayValue,
        });
      }
    }
    return formattedResults;
  };

  const groupResultsByFile = (results) => {
    const groupedResults = {};
    results.forEach(result => {
      if (!groupedResults[result.file]) {
        groupedResults[result.file] = [];
      }
      groupedResults[result.file].push(result);
    });
    return groupedResults;
  };

  const groupedResults = groupResultsByFile(results);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleMouseDown = (e) => {
    const rect = modalRef.current.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    modalRef.current.style.left = `${e.clientX - offset.current.x}px`;
    modalRef.current.style.top = `${e.clientY - offset.current.y}px`;
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="compute-summary-measures">
      {showModal && (
        <div
          className="modal"
          ref={modalRef}
          onMouseDown={handleMouseDown}
        >
          <div className="modal-content">
            <span className="close" onClick={handleCloseModal}>&times;</span>
            <h2>Welcome to Compute Summary Measures</h2>
            <p>Here you can select data files and summary measures to compute various metrics.</p>
            <p>Use the checkboxes to select the summary measures you are interested in.</p>
            <p>Click "Apply" to compute the selected summary measures for the chosen data file.</p>
          </div>
        </div>
      )}
      <div className="top-section">
        <div className="summary-measures">
          <h3>Summary Measures</h3>
          <div className="measure-items">
            {summaryMeasuresOptions.map((measure, index) => (
              <div 
                key={index} 
                className="measure-item" 
                title={measureTooltips[measure] || measure} // Custom tooltip content
              >
                <label>
                  <input
                    type="checkbox"
                    checked={selectedSummaryMeasures.includes(measure)}
                    onChange={() => handleSummaryMeasureToggle(measure)}
                  />
                  {measureDisplayNames[measure] || measure}
                </label>
              </div>
            ))}
          </div>
          <div className="measure-footer">
            <button onClick={handleSelectAllSummaryMeasures}>
              {selectedSummaryMeasures.length === summaryMeasuresOptions.length ? 'Unselect All' : 'Select All'}
            </button>
          </div>
        </div>
  
        <div className="selected-data">
          <h3>Data File</h3>
          <div className="data-items">
            {dataFiles.map((file, index) => (
              <div key={index} className="data-item">
                <label>
                  <input
                    type="checkbox"
                    name="dataFile"
                    value={file}
                    checked={selectedDataFiles.includes(file)}
                    onChange={handleDataFileChange}
                  />
                  {file}
                </label>
              </div>
            ))}
          </div>
          <div className="data-footer">
            <button onClick={handleSelectAllDataFiles}>
              {selectedDataFiles.length === dataFiles.length ? 'Unselect All' : 'Select All'}
            </button>
            <button onClick={handleApply}>Apply</button>
          </div>
        </div>
      </div>
  
      <div className="result-section">
        <h3>Result</h3>
        <div className="result-items">
          <table className="result-table">
            <tbody>
              {Object.entries(groupedResults).map(([file, measures], fileIndex) => (
                <>
                  <tr key={`file-${fileIndex}`} className="data-file-row">
                    <td colSpan="2">
                      <input
                        type="checkbox"
                        checked={selectedResults.includes(file)}
                        onChange={() => handleResultToggle(file)}
                      />
                      <strong>{file}</strong>
                    </td>
                  </tr>
                  <tr className="measure-header-row">
                    <th>Measure</th>
                    <th>Value</th>
                  </tr>
                  {measures.map((measure, measureIndex) => {
                    if (measure.measure === 'Homebases') {
                      const values = measure.value.split(', ');
                      return values.map((value, valueIndex) => (
                        <tr key={`${fileIndex}-${measureIndex}-${valueIndex}`} className="value-row">
                          <td>{valueIndex === 0 ? 'Homebases (KPname01)' : 'Homebases (KPname02)'}</td>
                          <td>{value}</td>
                        </tr>
                      ));
                    } else if (measure.measure === 'Mean Duration Stops') {
                      const values = measure.value.split(', ');
                      return values.map((value, valueIndex) => (
                        <tr key={`${fileIndex}-${measureIndex}-${valueIndex}`} className="value-row">
                          <td>{valueIndex === 0 ? 'Mean Duration Stops (KPmeanStayTime01_s)' : 'Mean Duration Stops (KPmeanStayTime01_s_log)'}</td>
                          <td>{value}</td>
                        </tr>
                      ));
                    } else {
                      return (
                        <tr key={`${fileIndex}-${measureIndex}`} className="value-row">
                          <td>{measure.measure}</td>
                          <td>{measure.value}</td>
                        </tr>
                      );
                    }
                  })}
                </>
              ))}
            </tbody>
          </table>
        </div>
        <div className="result-footer">
          <button onClick={handleSelectAllResults}>
            {selectedResults.length === results.length && results.length > 0 ? 'Unselect All' : 'Select All'}
          </button>
          <button onClick={handleDownloadSelected}>Download Selected</button>
        </div>
      </div>
    </div>
  );
};

export default ComputeSummaryMeasures;