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

  // Define measure keys that need whole-number formatting
  const wholeNumberMeasures = [
    "calc_homebases",
    "calc_HB1_cumulativeReturn",
    "calc_sessionTotalLocalesVisited",
    "calc_sessionTotalStops",
    "calc_HB2_cumulativeReturn"
  ];

  useEffect(() => {
    // Fetch metadata variables from the backend
    const fetchMetadataVariables = async () => {
      try {
        const response = await axios.get('http://ratbat.cas.mcmaster.ca/api/frdr-query/get-fields/');
        // Define the fields you want to remove
        const unwantedFields = ["sample_id", "t", "x", "y", "x_s", "y_s", "v_s", "movementtype_s"];
        // Flatten the response and filter out unwanted fields
        const allFields = Object.values(response.data).flat();
        setMetadataVariables(allFields.filter(field => !unwantedFields.includes(field)));
      } catch (error) {
        console.error("Error fetching metadata variables:", error);
      }
    };
  
    // Fetch data files from the backend
    const fetchDataFiles = async () => {
      try {
        const response = await axios.get('/api/summary-measures/data-files/');
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
    // Fetch metadata values for each selected data file
    const fetchMetadataValues = async (trialId) => {
      try {
        const payload = {
          filters: [{ field: 'trial_id', lookup: 'exact', value: trialId }],
          fields: selectedMetadataVariables,
        };
        console.log("Sending request to query-data with payload:", JSON.stringify(payload, null, 2));
        const response = await axios.post('http://ratbat.cas.mcmaster.ca/api/frdr-query/query-data/', payload);
        console.log(`Metadata response for trial ${trialId}:`, response.data);
        return response.data;
      } catch (error) {
        console.error(`Error fetching metadata values for trial ${trialId}:`, error);
        return [];
      }
    };
   
  
    // Update compiled data whenever selections change
    const updateCompiledData = async () => {
      const compiled = await Promise.all(
        selectedDataFiles.map(async (file) => {
          const metadataResponse = await fetchMetadataValues(file.trial_id); // Use trial_id instead of extracting from file name
          const metadataRecord = metadataResponse[0] || {};
          const measuresObj = {};
    
          selectedSummaryMeasures.forEach((measure) => {
            // Use trial_id as the key to access results
            if (results[file.trial_id] && results[file.trial_id][measure]) {
              measuresObj[measure] = Array.isArray(results[file.trial_id][measure])
                ? results[file.trial_id][measure]
                : [results[file.trial_id][measure]];
            } else {
              measuresObj[measure] = ['']; // Default to empty if no result is found
            }
          });
    
          return {
            file: file.file_name,
            metadata: metadataRecord,
            measures: measuresObj,
          };
        })
      );
      setCompiledData(compiled);
    };
  
    updateCompiledData();
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
    // Create dynamic headers for CSV
    const csvHeaders = [
      "Data File",
      ...selectedMetadataVariables,
      ...selectedSummaryMeasures.flatMap(measure => {
        const display = measureDisplayNames[measure] || measure;
        return Array.isArray(display) ? display : [display];
      })
    ];
  
    const csvContent = [
      csvHeaders.join(","),
      ...compiledData.map(({ file, metadata, measures }) => {
        const fileCell = `="${file}"`;
        const metadataCells = selectedMetadataVariables.map(variable => metadata[variable] || '');
        const summaryCells = selectedSummaryMeasures.flatMap(measure => {
          const vals = measures[measure] || [''];
          return Array.isArray(vals)
            ? vals.map(v => formatCSVValue(v, precision, wholeNumberMeasures.includes(measure)))
            : [formatCSVValue(vals, precision, wholeNumberMeasures.includes(measure))];
        });
        return [fileCell, ...metadataCells, ...summaryCells].join(",");
      })
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
        {/* Metadata Variables Section */}
        <div className="selection-group summary-measures">
          <h3>Metadata Variables</h3>
          <div className="selection-group-content">
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
          </div>
          <div className="selection-group-footer">
            <button onClick={handleSelectAllMetadataVariables}>
              {selectedMetadataVariables.length === metadataVariables.length
                ? 'Unselect All'
                : 'Select All'}
            </button>
          </div>
        </div>

        {/* Summary Measures Section */}
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
              {selectedSummaryMeasures.length === summaryMeasures.length
                ? 'Unselect All'
                : 'Select All'}
            </button>
          </div>
        </div>

        {/* Loaded Data Files Section */}
        <div className="selection-group data-file">
          <h3>Preprocessed Trials</h3>
          <div className="selection-group-content">
            {dataFiles.map((file, index) => (
              <div key={index} className="data-item">
                <label>
                  <input
                    type="checkbox"
                    value={file.file_name}
                    checked={selectedDataFiles.includes(file)}
                    onChange={() => handleDataFileToggle(file)}
                  />
                  {file.file_name}
                </label>
              </div>
            ))}
          </div>
          <div className="selection-group-footer">
            <button onClick={handleSelectAllDataFiles}>
              {selectedDataFiles.length === dataFiles.length
                ? 'Unselect All'
                : 'Select All'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="preview-section">
        <h3>Preview</h3>
        <div className="info-sheet-container">
          <span className="info-icon" title="This info sheet provides definitions and alternate names for all summary measures and metadata variables">
            i
          </span>
          <button
            className="download-info-sheet"
            onClick={() => window.location.href = '/info_sheet.xlsx'}
          >
            Download Info Sheet
          </button>
        </div>
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
          <div className="preview-section-table-container">
            <table className="preview-section-table">
              <thead>
                <tr>
                  <th>Data File</th>
                  {selectedMetadataVariables.map((variable, i) => (
                    <th key={i}>{variable}</th>
                  ))}
                  {selectedSummaryMeasures.map((measure) => {
                    const display = measureDisplayNames[measure] || measure;
                    return Array.isArray(display)
                      ? display.map((d, i) => <th key={`${measure}-${i}`}>{d}</th>)
                      : <th key={measure}>{display}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {compiledData.map(({ file, metadata, measures }, rowIndex) => (
                  <tr key={rowIndex}>
                    <td>{file}</td>
                    {selectedMetadataVariables.map((variable, i) => (
                      <td key={i}>{metadata[variable]}</td>
                    ))}
                    {selectedSummaryMeasures.map((measure) => {
                      const values = measures[measure] || [''];
                      return Array.isArray(values)
                        ? values.map((v, i) => (
                            <td key={`${measure}-${i}`}>
                              {formatValue(v, precision, wholeNumberMeasures.includes(measure))}
                            </td>
                          ))
                        : <td>{formatValue(values, precision, wholeNumberMeasures.includes(measure))}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="preview-section-footer">
          <button onClick={handleDownload}>Download Compiled Data</button>
        </div>
      </div>
    </div>
  );
};

export default CompileDataPage;
