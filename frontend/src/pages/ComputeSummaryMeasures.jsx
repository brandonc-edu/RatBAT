import React, { useState, useEffect, useRef, useContext } from 'react';
import './ComputeSummaryMeasures.css';
import axios from 'axios';
import { ResultsContext } from '../ResultsContext';

const ComputeSummaryMeasures = () => {
  const { results, setResults } = useContext(ResultsContext);
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
    if (selectedResults.length === Object.keys(results).length) {
      setSelectedResults([]);
    } else {
      setSelectedResults(Object.keys(results));
    }
  };

  const handleDownloadSelected = () => {
    const selectedData = Object.entries(results).filter(([file]) => selectedResults.includes(file));

    // Define CSV headers
    const csvHeaders = [
      "Data File",
      "Homebases (KPname01)",
      "Homebases (KPname02)",
      "Cumulative Return",
      "Mean Duration Stops (KPmeanStayTime01_s)",
      "Mean Duration Stops (KPmeanStayTime01_s_log)",
      "Mean Return",
      "Mean Excursion Stops",
      "Main Homebase Stop Duration",
      "Secondary Homebase Stop Duration",
      "Secondary Homebase Cumulative Return",
      "Expected Return Frequency Main Homebase",
      "Total Locales Visited",
      "Total Stops"
    ];

    const csvContent = [
      csvHeaders.join(","),
      ...selectedData.map(([file, measures]) => (
        [
          file,
          measures['calc_homebases'] ? measures['calc_homebases'][0] : '',
          measures['calc_homebases'] ? measures['calc_homebases'][1] : '',
          measures['calc_HB1_cumulativeReturn'] || '',
          measures['calc_HB1_meanDurationStops'] ? measures['calc_HB1_meanDurationStops'][0] : '',
          measures['calc_HB1_meanDurationStops'] ? measures['calc_HB1_meanDurationStops'][1] : '',
          measures['calc_HB1_meanReturn'] || '',
          measures['calc_HB1_meanExcursionStops'] || '',
          measures['calc_HB1_stopDuration'] || '',
          measures['calc_HB2_stopDuration'] || '',
          measures['calc_HB2_cumulativeReturn'] || '',
          measures['calc_HB1_expectedReturn'] || '',
          measures['calc_sessionTotalLocalesVisited'] || '',
          measures['calc_sessionTotalStops'] || ''
        ].join(",")
      ))
    ].join("\n");

    console.log("CSV Content:", csvContent); // Debugging statement

    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
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

      console.log("Results from API:", response.data);
      const formattedResults = formatResults(response.data);
      console.log("Formatted Results:", formattedResults);
      setResults(formattedResults);
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
    calc_HB1_stopDuration: 'Main Homebase Stop Duration',
    calc_HB2_stopDuration: 'Secondary Homebase Stop Duration',
    calc_HB2_cumulativeReturn: 'Secondary Homebase Cumulative Return',
    calc_HB1_expectedReturn: 'Expected Return Frequency Main Homebase',
    calc_sessionTotalLocalesVisited: 'Total Locales Visited',
    calc_sessionTotalStops: 'Total Stops',
  };

  const measureTooltips = {
    calc_homebases: 'KPname',
    calc_HB1_cumulativeReturn: 'KPcumReturnfreq01',
    calc_HB1_meanDurationStops: 'KPmeanStayTime01',
    calc_HB1_meanReturn: 'KPcumReturnfreq01',
    calc_HB1_meanExcursionStops: 'KPstopsToReturn01',
    calc_HB1_stopDuration: 'KPtotalStayTime01_s',
    calc_HB2_stopDuration: 'KPtotalStayTime02_s',
    calc_HB2_cumulativeReturn: 'KPcumReturnfreq02',
    calc_HB1_expectedReturn: 'KPexpReturnfreq01',
    calc_sessionTotalLocalesVisited: 'KP_session_differentlocalesVisited_#',
    calc_sessionTotalStops: 'KP_session_Stops_total#',
  };

  const formatResults = (data) => {
    const formattedResults = {};
    for (const [file, measures] of Object.entries(data)) {
      formattedResults[file] = {};
      for (const [key, value] of Object.entries(measures)) {
        if (!selectedSummaryMeasures.includes(key)) {
          continue; // Skip measures that are not selected
        }
        let displayValue;
        if (key === "calc_homebases") {
          displayValue = Array.isArray(value) && value.length === 2 ? value : ['Main - N/A', 'Secondary - N/A'];
        } else if (key === "calc_HB1_meanDurationStops" && Array.isArray(value)) {
          displayValue = value;
        } else {
          displayValue = [value];
        }
        formattedResults[file][key] = displayValue;
      }
    }
    console.log("Formatted Results in formatResults:", formattedResults);
    return formattedResults;
  };

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
          <thead>
            <tr>
              <th></th> {/* Empty header for checkboxes */}
              <th>Data File</th>
              <th>Homebases (KPname01)</th>
              <th>Homebases (KPname02)</th>
              <th>Cumulative Return</th>
              <th>Mean Duration Stops (KPmeanStayTime01_s)</th>
              <th>Mean Duration Stops (KPmeanStayTime01_s_log)</th>
              <th>Mean Return</th>
              <th>Mean Excursion Stops</th>
              <th>Main Homebase Stop Duration</th>
              <th>Secondary Homebase Stop Duration</th>
              <th>Secondary Homebase Cumulative Return</th>
              <th>Expected Return Frequency Main Homebase</th>
              <th>Total Locales Visited</th>
              <th>Total Stops</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(results).map(([file, measures], fileIndex) => (
              <tr key={`file-${fileIndex}`}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedResults.includes(file)}
                    onChange={() => handleResultToggle(file)}
                  />
                </td>
                <td>{file}</td>
                <td>{measures['calc_homebases'] ? measures['calc_homebases'][0] : ''}</td>
                <td>{measures['calc_homebases'] ? measures['calc_homebases'][1] : ''}</td>
                <td>{measures['calc_HB1_cumulativeReturn'] || ''}</td>
                <td>{measures['calc_HB1_meanDurationStops'] ? measures['calc_HB1_meanDurationStops'][0] : ''}</td>
                <td>{measures['calc_HB1_meanDurationStops'] ? measures['calc_HB1_meanDurationStops'][1] : ''}</td>
                <td>{measures['calc_HB1_meanReturn'] || ''}</td>
                <td>{measures['calc_HB1_meanExcursionStops'] || ''}</td>
                <td>{measures['calc_HB1_stopDuration'] || ''}</td>
                <td>{measures['calc_HB2_stopDuration'] || ''}</td>
                <td>{measures['calc_HB2_cumulativeReturn'] || ''}</td>
                <td>{measures['calc_HB1_expectedReturn'] || ''}</td>
                <td>{measures['calc_sessionTotalLocalesVisited'] || ''}</td>
                <td>{measures['calc_sessionTotalStops'] || ''}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
        <div className="result-footer">
          <button onClick={handleSelectAllResults}>
            {selectedResults.length === Object.keys(results).length && Object.keys(results).length > 0 ? 'Unselect All' : 'Select All'}
          </button>
          <button onClick={handleDownloadSelected}>Download Selected</button>
        </div>
      </div>
    </div>
  );
};

export default ComputeSummaryMeasures;