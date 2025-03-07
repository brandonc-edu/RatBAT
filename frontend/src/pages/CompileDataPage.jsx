import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './CompileDataPage.css';
import { ResultsContext } from '../ResultsContext';

const CompileDataPage = () => {
  const { results } = useContext(ResultsContext);
  const [metadataVariables, setMetadataVariables] = useState([]);
  const [dataFiles, setDataFiles] = useState([]);
  const [summaryMeasures, setSummaryMeasures] = useState([]);
  const [selectedMetadataVariables, setSelectedMetadataVariables] = useState([]);
  const [selectedDataFiles, setSelectedDataFiles] = useState([]);
  const [selectedSummaryMeasures, setSelectedSummaryMeasures] = useState([]);
  const [compiledData, setCompiledData] = useState([]);
  const [precision, setPrecision] = useState(2); // Add precision state

  const measureDisplayNames = {
    calc_homebases: ['Homebases (KPname01)', 'Homebases (KPname02)'],
    calc_HB1_cumulativeReturn: 'Cumulative Return',
    calc_HB1_meanDurationStops: ['Mean Duration Stops (KPmeanStayTime01_s)', 'Mean Duration Stops (KPmeanStayTime01_s_log)'],
    calc_HB1_meanReturn: 'Mean Return',
    calc_HB1_meanExcursionStops: 'Mean Excursion Stops',
    calc_HB1_stopDuration: 'Main Homebase Stop Duration',
    calc_HB2_stopDuration: 'Secondary Homebase Stop Duration',
    calc_HB2_cumulativeReturn: 'Secondary Homebase Cumulative Return',
    calc_HB1_expectedReturn: 'Expected Return Frequency Main Homebase',
    calc_sessionTotalLocalesVisited: 'Total Locales Visited',
    calc_sessionTotalStops: 'Total Stops',
  };

  const measureSelectAreaDisplayNames = {
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

  useEffect(() => {
    // Fetch metadata variables from the backend
    const fetchMetadataVariables = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/metadata-variables/');
        setMetadataVariables(response.data);
      } catch (error) {
        console.error("Error fetching metadata variables:", error);
      }
    };

    // Fetch data files from the backend
    const fetchDataFiles = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/data-files/');
        setDataFiles(response.data);
      } catch (error) {
        console.error("Error fetching data files:", error);
      }
    };

    fetchMetadataVariables();
    fetchDataFiles();
  }, []);

  useEffect(() => {
    // Update summary measures based on the results from ComputeSummaryMeasures
    const computedSummaryMeasures = Object.keys(results).length > 0 ? Object.keys(results[Object.keys(results)[0]]) : [];
    setSummaryMeasures(computedSummaryMeasures);
  }, [results]);

  useEffect(() => {
    // Update compiled data whenever selections change
    const compiled = selectedDataFiles.map(file => {
      const metadata = metadataVariables.filter(variable => selectedMetadataVariables.includes(variable));
      const measuresObj = {};
      selectedSummaryMeasures.forEach(measure => {
        if (results[file] && results[file][measure]) {
          measuresObj[measure] = Array.isArray(results[file][measure])
            ? results[file][measure]
            : [results[file][measure]];
        } else {
          measuresObj[measure] = [''];
        }
      });
      return {
        file,
        metadata,
        measures: measuresObj
      };
    });

    setCompiledData(compiled);
  }, [selectedMetadataVariables, selectedDataFiles, selectedSummaryMeasures, metadataVariables, summaryMeasures, results]);

  const handleMetadataVariableToggle = (variable) => {
    setSelectedMetadataVariables(prevSelected =>
      prevSelected.includes(variable)
        ? prevSelected.filter(item => item !== variable)
        : [...prevSelected, variable]
    );
  };

  const handleSelectAllMetadataVariables = () => {
    if (selectedMetadataVariables.length === metadataVariables.length) {
      setSelectedMetadataVariables([]);
    } else {
      setSelectedMetadataVariables(metadataVariables);
    }
  };

  const handleSummaryMeasureToggle = (measure) => {
    setSelectedSummaryMeasures(prevSelected =>
      prevSelected.includes(measure)
        ? prevSelected.filter(item => item !== measure)
        : [...prevSelected, measure]
    );
  };

  const handleSelectAllSummaryMeasures = () => {
    if (selectedSummaryMeasures.length === summaryMeasures.length) {
      setSelectedSummaryMeasures([]);
    } else {
      setSelectedSummaryMeasures(summaryMeasures);
    }
  };

  const handleDataFileToggle = (file) => {
    setSelectedDataFiles(prevSelected =>
      prevSelected.includes(file)
        ? prevSelected.filter(item => item !== file)
        : [...prevSelected, file]
    );
  };

  const handleSelectAllDataFiles = () => {
    if (selectedDataFiles.length === dataFiles.length) {
      setSelectedDataFiles([]);
    } else {
      setSelectedDataFiles(dataFiles);
    }
  };

  const formatValue = (value, precision, isWholeNumber = false) => {
    if (value === null || value === undefined) return '';
    if (isWholeNumber) {
      // Round the value to the nearest whole number
      return Math.round(parseFloat(value)).toString();
    }
    return parseFloat(value).toFixed(precision);
  };
  
  const formatCSVValue = (value, precision, isWholeNumber = false) => {
    if (value === null || value === undefined) return '';
    if (isWholeNumber) {
      return `="${Math.round(parseFloat(value)).toString()}"`;
    }
    return `="${parseFloat(value).toFixed(precision)}"`;
  };  

  const handleDownload = () => {
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
      ...compiledData.map(({ file, metadata, measures }) => (
        [
          `="${file}"`, // Wrap file as text as well
          formatCSVValue(measures['calc_homebases'] ? measures['calc_homebases'][0] : '', precision, true),
          formatCSVValue(measures['calc_homebases'] ? measures['calc_homebases'][1] : '', precision, true),
          formatCSVValue(measures['calc_HB1_cumulativeReturn'], precision, true),
          formatCSVValue(measures['calc_HB1_meanDurationStops'] ? measures['calc_HB1_meanDurationStops'][0] : '', precision),
          formatCSVValue(measures['calc_HB1_meanDurationStops'] ? measures['calc_HB1_meanDurationStops'][1] : '', precision),
          formatCSVValue(measures['calc_HB1_meanReturn'], precision),
          formatCSVValue(measures['calc_HB1_meanExcursionStops'], precision),
          formatCSVValue(measures['calc_HB1_stopDuration'], precision),
          formatCSVValue(measures['calc_HB2_stopDuration'], precision),
          formatCSVValue(measures['calc_HB2_cumulativeReturn'], precision, true),
          formatCSVValue(measures['calc_HB1_expectedReturn'], precision),
          formatCSVValue(measures['calc_sessionTotalLocalesVisited'], precision, true),
          formatCSVValue(measures['calc_sessionTotalStops'], precision, true)
        ].join(",")
      ))
    ].join("\n");

    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "compiled_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="compile-data-page">
      <div className="selection-section">
        <div className="selection-group summary-measures">
          <h3>Metadata Variables</h3>
          {metadataVariables.map((variable, index) => (
            <div key={index} className="measure-item">
              <label>
                <input
                  type="checkbox"
                  value={variable}
                  checked={selectedMetadataVariables.includes(variable)}
                  onChange={() => handleMetadataVariableToggle(variable)}
                />
                {variable}
              </label>
            </div>
          ))}
          <div className="selection-group-footer">
            <button onClick={handleSelectAllMetadataVariables}>
              {selectedMetadataVariables.length === metadataVariables.length ? 'Unselect All' : 'Select All'}
            </button>
          </div>
        </div>
        <div className="selection-group summary-measures">
          <h3>Summary Measures</h3>
          <div className="selection-group-content">
            {summaryMeasures.map((measure, index) => (
              <div key={index} className="measure-item">
                <label>
                  <input
                    type="checkbox"
                    value={measure}
                    checked={selectedSummaryMeasures.includes(measure)}
                    onChange={() => handleSummaryMeasureToggle(measure)}
                  />
                  {measureSelectAreaDisplayNames[measure] || measure}
                </label>
              </div>
            ))}
          </div>
          <div className="selection-group-footer">
            <button onClick={handleSelectAllSummaryMeasures}>
              {selectedSummaryMeasures.length === summaryMeasures.length ? 'Unselect All' : 'Select All'}
            </button>
          </div>
        </div>
        <div className="selection-group data-file">
          <h3>Loaded Data Files</h3>
          <div className="selection-group-content">
            {dataFiles.map((file, index) => (
              <div key={index} className="data-item">
                <label>
                  <input
                    type="checkbox"
                    value={file}
                    checked={selectedDataFiles.includes(file)}
                    onChange={() => handleDataFileToggle(file)}
                  />
                  {file}
                </label>
              </div>
            ))}
          </div>
          <div className="selection-group-footer">
            <button onClick={handleSelectAllDataFiles}>
              {selectedDataFiles.length === dataFiles.length ? 'Unselect All' : 'Select All'}
            </button>
          </div>
        </div>
      </div>
      <div className="preview-section">
        <h3>Preview</h3>
        <div className="precision-selector">
          <label htmlFor="precision">Select Precision:</label>
          <select
            id="precision"
            value={precision}
            onChange={(e) => setPrecision(parseInt(e.target.value))}
          >
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
          <table className="preview-section-table">
            <thead>
              <tr>
                <th>Data File</th>
                {selectedMetadataVariables.map((variable, index) => (
                  <th key={index}>{variable}</th>
                ))}
                {selectedSummaryMeasures.flatMap(measure => measureDisplayNames[measure] || measure).map((name, index) => (
                  <th key={index}>{name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compiledData.map(({ file, metadata, measures }, index) => (
                <tr key={index}>
                  <td>{file}</td>
                  {metadata.map((m, i) => (
                    <td key={i}>{m.value}</td>
                  ))}
                  {/* Homebases */}
                  <td>{formatValue(measures['calc_homebases'] ? measures['calc_homebases'][0] : '', precision, true)}</td>
                  <td>{formatValue(measures['calc_homebases'] ? measures['calc_homebases'][1] : '', precision, true)}</td>
                  {/* Cumulative Return */}
                  <td>{formatValue(measures['calc_HB1_cumulativeReturn'] ? measures['calc_HB1_cumulativeReturn'][0] : '', precision, true)}</td>
                  {/* Other measures using decimal formatting */}
                  <td>{formatValue(measures['calc_HB1_meanDurationStops'] ? measures['calc_HB1_meanDurationStops'][0] : '', precision)}</td>
                  <td>{formatValue(measures['calc_HB1_meanDurationStops'] ? measures['calc_HB1_meanDurationStops'][1] : '', precision)}</td>
                  <td>{formatValue(measures['calc_HB1_meanReturn'], precision)}</td>
                  <td>{formatValue(measures['calc_HB1_meanExcursionStops'], precision)}</td>
                  <td>{formatValue(measures['calc_HB1_stopDuration'], precision)}</td>
                  <td>{formatValue(measures['calc_HB2_stopDuration'], precision)}</td>
                  {/* Secondary Cumulative Return */}
                  <td>{formatValue(measures['calc_HB2_cumulativeReturn'] ? measures['calc_HB2_cumulativeReturn'][0] : '', precision, true)}</td>
                  <td>{formatValue(measures['calc_HB1_expectedReturn'], precision)}</td>
                  {/* Total Locales Visited */}
                  <td>{formatValue(measures['calc_sessionTotalLocalesVisited'] ? measures['calc_sessionTotalLocalesVisited'][0] : '', precision, true)}</td>
                  {/* Total Stops */}
                  <td>{formatValue(measures['calc_sessionTotalStops'] ? measures['calc_sessionTotalStops'][0] : '', precision, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="preview-section-footer">
          <button onClick={handleDownload}>Download Compiled Data</button>
        </div>
      </div>
    </div>
  );
};

export default CompileDataPage;