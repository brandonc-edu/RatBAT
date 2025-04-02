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
  const [precision, setPrecision] = useState(2);
  const [showModal, setShowModal] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const modalRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Fetch available data files from the backend
    const fetchDataFiles = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/summary-measures/data-files/');
        console.log("Fetched data files:", response.data);
        setDataFiles(response.data);
      } catch (error) {
        console.error("Error fetching data files:", error);
      }
    };

    // Fetch summary measures options from the backend
    const fetchSummaryMeasures = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/summary-measures/summary-measures/');
        console.log("Fetched summary measures:", response.data);
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
    const selectedData = Object.entries(results).filter(([file]) =>
      selectedResults.includes(file)
    );
    
    const csvHeaders = [
      "Data File",
      ...computedMeasureKeys.flatMap(key => {
        if (key === "calc_homebases") {
          return ["Homebases (KPname01)", "Homebases (KPname02)"];
        } else if (key === "calc_HB1_meanDurationStops") {
          return [
            "Mean Duration Stops (KPmeanStayTime01_s)",
            "Mean Duration Stops (KPmeanStayTime01_s_log)"
          ];
        } else {
          return [measureDisplayNames[key] || key];
        }
      })
    ];
    
    const csvContent = [
      csvHeaders.join(","),
      ...selectedData.map(([file, measures]) => {
        const row = [ `="${file}"` ];
        computedMeasureKeys.forEach(key => {
          if (key === "calc_homebases") {
            row.push(formatCSVValue(measures[key] ? measures[key][0] : '', precision, true));
            row.push(formatCSVValue(measures[key] ? measures[key][1] : '', precision, true));
          } else if (key === "calc_HB1_meanDurationStops") {
            row.push(formatCSVValue(measures[key] ? measures[key][0] : '', precision));
            row.push(formatCSVValue(measures[key] ? measures[key][1] : '', precision));
          } else {
            row.push(
              formatCSVValue(
                measures[key] ? measures[key][0] : '',
                precision,
                wholeNumberKeys.includes(key)
              )
            );
          }
        });
        return row.join(",");
      })
    ].join("\n");
    
    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "selected_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };  

  const handleApply = async () => {
    if (selectedDataFiles.length === 0) {
      alert("Please select at least one data file.");
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/summary-measures/compute-summary-measures/', {
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

  const formatValue = (value, precision, isWholeNumber = false) => {
    if (value === null || value === undefined) return '';
    if (isWholeNumber) {
      return parseInt(value).toString();
    } else {
      return parseFloat(value).toFixed(precision);
    }
  };

  const formatCSVValue = (value, precision, isWholeNumber = false) => {
    if (value === null || value === undefined) return '';
    if (isWholeNumber) {
      return `="${parseInt(value).toString()}"`;
    } else {
      return `="${parseFloat(value).toFixed(precision)}"`;
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
    calc_HB1_meanReturn: 'KPreturntime01_s',
    calc_HB1_meanExcursionStops: 'KPstopsToReturn01',
    calc_HB1_stopDuration: 'KPtotalStayTime01_s',
    calc_HB2_stopDuration: 'KPtotalStayTime02_s',
    calc_HB2_cumulativeReturn: 'KPcumReturnfreq02',
    calc_HB1_expectedReturn: 'KPexpReturnfreq01',
    calc_sessionTotalLocalesVisited: 'KP_session_differentlocalesVisited_#',
    calc_sessionTotalStops: 'KP_session_Stops_total#',
  };

  // New mapping for full definitions to be shown on the info buttons
  const measureDefinitions = {
    calc_homebases: 'The primary and secondary homebases of the specimen.',
    calc_HB1_cumulativeReturn: 'Cumulative number of stops within the first home base',
    calc_HB1_meanDurationStops: 'The mean duration of staying in home base by dividing cumulative duration of stops within the first home base by the number of stops within the first home base',
    calc_HB1_meanReturn: 'Gives the mean return time to the first home base (durations of excursions) in seconds.',
    calc_HB1_meanExcursionStops: 'Gives the mean number of stops during the excursions from the first home base; the algorithm does not take into account the last stop before exiting the home base and the first stop after entering the home base.',
    calc_HB1_stopDuration: 'Cumulative duration of stops within the first home base (number of seconds within the first homebase).',
    calc_HB2_stopDuration: 'Cumulative duration of stops within the second home base (number of seconds within the second home base).',
    calc_HB2_cumulativeReturn: 'Cumulative number of stops within the second home base.',
    calc_HB1_expectedReturn: 'Gives the number of stops within the first home base multiplied by number of locales visited during the session (a part of the session) divided by the total number of stops during the session (part of the session)',
    calc_sessionTotalLocalesVisited: 'Gives the number of different locales visited during the session.',
    calc_sessionTotalStops: 'Gives the total number of stops during the session.',
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

  const handleInfoClick = () => {
    setShowInfo(!showInfo);
  };

  const computedMeasureKeys =
    Object.keys(results).length > 0
      ? Object.keys(results[Object.keys(results)[0]])
      : [];
  
  const wholeNumberKeys = [
    "calc_HB1_cumulativeReturn",
    "calc_HB2_cumulativeReturn",
    "calc_sessionTotalLocalesVisited",
    "calc_sessionTotalStops"
  ];

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
              <div key={index} className="measure-item">
                <div className="tooltip-container">
                  <button className="info-button">i</button>
                  <span className="tooltip-text">
                    {measureDefinitions[measure] || "No definition available."}
                  </span>
                </div>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedSummaryMeasures.includes(measure)}
                    onChange={() => handleSummaryMeasureToggle(measure)}
                  />
                  <span title={measureTooltips[measure] || measure}>
                    {measureDisplayNames[measure] || measure}
                  </span>
                </label>
              </div>
            ))}
          </div>
          <div className="measure-footer">
            <button className="info-button" onClick={handleInfoClick}>?</button>
            <button onClick={handleSelectAllSummaryMeasures}>
              {selectedSummaryMeasures.length === summaryMeasuresOptions.length ? 'Unselect All' : 'Select All'}
            </button>
          </div>

          {showInfo && (
            <div className="info-modal">
              <div className="info-modal-content">
                <span className="close" onClick={handleInfoClick}>&times;</span>
                <p>
                  Summary measures are metrics computed from the selected data files. They provide insights into various aspects of the data, such as the main and secondary home base of the rat, its average “stay at home” time, average time to return to home base, and more.
                </p>
              </div>
            </div>
          )}
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
        <div className="precision-selector">
          <label htmlFor="precision">Select Precision:</label>
          <select
            id="precision"
            value={precision}
            onChange={(e) => setPrecision(parseInt(e.target.value))}
          >
            <option value={0}>0 Decimal</option>
            <option value={1}>1 Decimal</option>
            <option value={2}>2 Decimals</option>
            <option value={3}>3 Decimals</option>
            <option value={4}>4 Decimals</option>
            <option value={5}>5 Decimals</option>
            <option value={6}>6 Decimals</option>
            <option value={7}>7 Decimals</option>
            <option value={8}>8 Decimals</option>
            <option value={9}>9 Decimals</option>
            <option value={10}>10 Decimals</option>
          </select>
        </div>
        <div className="result-items">
          <table className="result-table">
            <thead>
              <tr>
                <th></th> {/* For checkboxes */}
                <th>Data File</th>
                {computedMeasureKeys.map(key => {
                  if (key === "calc_homebases") {
                    return (
                      <React.Fragment key={key}>
                        <th>Homebases (KPname01)</th>
                        <th>Homebases (KPname02)</th>
                      </React.Fragment>
                    );
                  } else if (key === "calc_HB1_meanDurationStops") {
                    return (
                      <React.Fragment key={key}>
                        <th>Mean Duration Stops (KPmeanStayTime01_s)</th>
                        <th>Mean Duration Stops (KPmeanStayTime01_s_log)</th>
                      </React.Fragment>
                    );
                  } else {
                    return <th key={key}>{measureDisplayNames[key] || key}</th>;
                  }
                })}
              </tr>
            </thead>
            <tbody>
              {Object.entries(results).map(([file, measures], fileIndex) => (
                <tr key={fileIndex}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedResults.includes(file)}
                      onChange={() => handleResultToggle(file)}
                    />
                  </td>
                  <td>{file}</td>
                  {computedMeasureKeys.map(key => {
                    if (key === "calc_homebases") {
                      return (
                        <React.Fragment key={key}>
                          <td>{measures[key] ? formatValue(measures[key][0], precision, true) : ''}</td>
                          <td>{measures[key] ? formatValue(measures[key][1], precision, true) : ''}</td>
                        </React.Fragment>
                      );
                    } else if (key === "calc_HB1_meanDurationStops") {
                      return (
                        <React.Fragment key={key}>
                          <td>{measures[key] ? formatValue(measures[key][0], precision) : ''}</td>
                          <td>{measures[key] ? formatValue(measures[key][1], precision) : ''}</td>
                        </React.Fragment>
                      );
                    } else {
                      return (
                        <td key={`${file}-${key}`}>
                          {measures[key]
                            ? formatValue(measures[key][0], precision, wholeNumberKeys.includes(key))
                            : ''}
                        </td>
                      );
                    }
                  })}
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