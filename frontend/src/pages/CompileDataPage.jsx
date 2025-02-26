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
      const measures = summaryMeasures.filter(measure => selectedSummaryMeasures.includes(measure));
      return {
        file,
        metadata,
        measures: measures.reduce((acc, measure) => {
          if (results[file] && results[file][measure]) {
            if (Array.isArray(results[file][measure])) {
              acc.push(...results[file][measure]);
            } else {
              acc.push(results[file][measure]);
            }
          } else {
            acc.push('');
          }
          return acc;
        }, [])
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

  const handleDownload = () => {
    // Convert compiled data to CSV and trigger download
    const csvHeaders = ["Data File", ...selectedMetadataVariables, ...selectedSummaryMeasures.flatMap(measure => measureDisplayNames[measure] || measure)];
    const csvContent = [
      csvHeaders.join(","),
      ...compiledData.map(({ file, metadata, measures }) => (
        [
          file,
          ...metadata.map(m => m.value),
          ...measures
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
      <h2>Compile Data</h2>
      <div className="selection-section">
        <div className="selection-group">
          <h3>Metadata Variables</h3>
          {metadataVariables.map((variable, index) => (
            <div key={index}>
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
          <button onClick={handleSelectAllMetadataVariables}>
            {selectedMetadataVariables.length === metadataVariables.length ? 'Unselect All' : 'Select All'}
          </button>
        </div>
        <div className="selection-group">
          <h3>Summary Measures</h3>
          {summaryMeasures.map((measure, index) => (
            <div key={index}>
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
          <button onClick={handleSelectAllSummaryMeasures}>
            {selectedSummaryMeasures.length === summaryMeasures.length ? 'Unselect All' : 'Select All'}
          </button>
        </div>
        <div className="selection-group">
          <h3>Loaded Data Files</h3>
          {dataFiles.map((file, index) => (
            <div key={index}>
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
          <button onClick={handleSelectAllDataFiles}>
            {selectedDataFiles.length === dataFiles.length ? 'Unselect All' : 'Select All'}
          </button>
        </div>
      </div>
      <div className="action-section">
        <button onClick={handleDownload}>Download Compiled Data</button>
      </div>
      <div className="preview-section">
        <h3>Preview</h3>
        <table>
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
                {measures.map((m, i) => (
                  <td key={i}>{m}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompileDataPage;