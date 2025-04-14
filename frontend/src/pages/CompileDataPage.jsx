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
    calc_sessionReturnTimeMean : "Mean Return Time All Locales",
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
    calc_sessionReturnTimeMean : "Mean Return Time All Locales",
    calc_distanceTravelled : "Distance Travelled",
  };

  // Define measure keys that need whole-number formatting
  const wholeNumberMeasures = [
    "calc_homebases",
    "calc_HB1_cumulativeReturn",
    "calc_sessionTotalLocalesVisited",
    "calc_sessionTotalStops",
    "calc_HB2_cumulativeReturn"
  ];

  const metadataFieldMapping = {
    "animal__animal_id": "animal_id",
    "animal__lightcyclecolony__lightcyclecolony_id": "lightcyclecolony_id",
    "animal__lightcyclecolony__lightcyclecolonydesc": "lightcyclecolonydesc",
    "animal__lightcycletest__lightcycletest_id": "lightcycletest_id",
    "animal__lightcycletest__lightcycletestdesc": "lightcycletestdesc",
    "apparatus__apparatus_id": "apparatus_id",
    "apparatus__arenaloc__arenaloc_id": "arenaloc_id",
    "apparatus__arenaloc__arenalocdesc": "arenalocdesc",
    "apparatus__arenaobjects__arenaobjects_id": "arenaobjects_id",
    "apparatus__arenaobjects__arenaobjectsdesc": "arenaobjectsdesc",
    "apparatus__arenatype__arenatype_id": "arenatype_id",
    "apparatus__arenatype__arenatypedesc": "arenatypedesc",
    "apparatus__lightconditions__lightconditions_id": "lightconditions_id",
    "apparatus__lightconditions__lightconditionsdesc": "lightconditionsdesc",
    "treatment__surgerymanipulation__surgerymanipulation_id": "surgerymanipulation_id",
    "treatment__surgerymanipulation__surgerymanipulationdesc": "surgerymanipulationdesc",
    "treatment__surgeryoutcome__surgeryoutcome_id": "surgeryoutcome_id",
    "treatment__surgeryoutcome__surgeryoutcomedesc": "surgeryoutcomedesc",
    "eventtype__eventtype_id": "eventtype_id",
    "eventtype__eventtypedesc": "eventtypedesc",
    "experimentgroup__experiment__experiment_id": "experiment_id",
    "experimentgroup__experiment__experimentdesc": "experimentdesc",
    "experimentgroup__experiment__studygroup__study__study_id": "study_id",
    "experimentgroup__experiment__studygroup__study__studydesc": "studydesc",
    "experimentgroup__experiment__studygroup__study__projectgroup__project__project_id": "project_id",
    "experimentgroup__experiment__studygroup__study__projectgroup__project__projectdesc": "projectdesc",
    "treatment__drugrx_drug1": "drugrx_drug1",
    "treatment__drugrx_dose1": "drugrx_dose1",
    "treatment__drugrx_drug2": "drugrx_drug2",
    "treatment__drugrx_dose2": "drugrx_dose2",
    "treatment__drugrx_drug3": "drugrx_drug3",
    "treatment__drugrx_dose3": "drugrx_dose3",
    "trial_id": "trial_id",
    "dateandtime": "dateandtime",
    "animalweight": "animalweight",
    "injectionnumber": "injectionnumber",
    "oftestnumber": "oftestnumber",
    "drugrxnumber": "drugrxnumber",
    "experimenter": "experimenter",
    "duration": "duration",
    "fallsduringtest": "fallsduringtest",
    "notes": "notes",
    "preprocessed": "preprocessed",
    "trackfile": "trackfile",
    "pathplot": "pathplot",
    "video": "video",
    "video_id": "video_id",
    "fall__timewhenfell": "timewhenfell",
  };
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

    const updateCompiledData = async () => {
      const compiled = await Promise.all(
        selectedDataFiles.map(async (file) => {
          const metadataResponse = await fetchMetadataValues(file.trial_id);
          const metadataRecord = metadataResponse[0] || {};
    
          // Transform metadata keys using the mapping
          const transformedMetadata = {};
          Object.keys(metadataRecord).forEach((key) => {
            const mappedKey = metadataFieldMapping[key] || key; // Use the mapped key or fallback to the original key
            transformedMetadata[mappedKey] = metadataRecord[key];
          });
    
          const measuresObj = {};
          selectedSummaryMeasures.forEach((measure) => {
            if (results[file.trial_id] && results[file.trial_id][measure]) {
              measuresObj[measure] = Array.isArray(results[file.trial_id][measure])
                ? results[file.trial_id][measure]
                : [results[file.trial_id][measure]];
            } else {
              measuresObj[measure] = [''];
            }
          });
    
          return {
            file: file.file_name,
            metadata: transformedMetadata,
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
    const csvHeaders = [
      "Data File",
      ...selectedMetadataVariables.map((variable) => variable), // Use selected metadata variables
      ...selectedSummaryMeasures.flatMap((measure) => {
        if (measure === "calc_distanceTravelled") {
          return [
            "Total Distance (Progression) (m)",
            "Total Distance (All) (m)",
            "Total Duration (s)",
            "Speed of Progression (m/s)",
            "Distances (Progression) (5-min intervals)",
            "Distances (All) (5-min intervals)",
          ];
        } else {
          const display = measureDisplayNames[measure] || measure;
          return Array.isArray(display) ? display : [display];
        }
      }),
    ];
  
    const csvContent = [
      csvHeaders.join(","), // Add headers
      ...compiledData.map(({ file, metadata, measures }) => {
        const fileCell = `="${file}"`; // Ensure file name is included
  
        const metadataCells = selectedMetadataVariables.map((variable) => {
          // Directly access using the transformed key
          const value = metadata[variable] || '';
          // Wrap the text value in quotes (and prepend an equal sign to force text format in Excel if needed)
          return `="${value}"`;
        });
        
        const summaryCells = selectedSummaryMeasures.flatMap((measure) => {
          if (measure === "calc_distanceTravelled") {
            const distanceValues = measures[measure] || [];
            return [
              formatCSVValue(distanceValues[0] ? distanceValues[0][0] : '', precision),
              formatCSVValue(distanceValues[0] ? distanceValues[0][1] : '', precision),
              formatCSVValue(distanceValues[1] ? distanceValues[1] : '', precision),
              formatCSVValue(distanceValues[2] ? distanceValues[2] : '', precision),
              distanceValues[3] && Array.isArray(distanceValues[3][0])
                ? distanceValues[3][0].map((val) => formatCSVValue(val, precision)).join("; ")
                : '',
              distanceValues[3] && Array.isArray(distanceValues[3][1])
                ? distanceValues[3][1].map((val) => formatCSVValue(val, precision)).join("; ")
                : '',
            ];
          } else {
            const vals = measures[measure] || [''];
            return Array.isArray(vals)
              ? vals.map((v) => formatCSVValue(v, precision, wholeNumberMeasures.includes(measure)))
              : [formatCSVValue(vals, precision, wholeNumberMeasures.includes(measure))];
          }
        });
  
        return [fileCell, ...metadataCells, ...summaryCells].join(",");
      }),
    ].join("\n");
  
    const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
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
                {selectedSummaryMeasures.flatMap((measure) => {
                  if (measure === "calc_distanceTravelled") {
                    return [
                      "Total Distance (Progression) (m)",
                      "Total Distance (All) (m)",
                      "Total Duration (s)",
                      "Speed of Progression (m/s)",
                      "Distances (Progression) (5-min intervals)",
                      "Distances (All) (5-min intervals)",
                    ].map((header, i) => <th key={`${measure}-${i}`}>{header}</th>);
                  } else {
                    const display = measureDisplayNames[measure] || measure;
                    return Array.isArray(display)
                      ? display.map((d, i) => <th key={`${measure}-${i}`}>{d}</th>)
                      : <th key={measure}>{display}</th>;
                  }
                })}
              </tr>
            </thead>
            <tbody>
              {compiledData.map(({ file, metadata, measures }, rowIndex) => (
                <tr key={rowIndex}>
                  <td>{file}</td>
                  {selectedMetadataVariables.map((variable, i) => (
                    <td key={i}>{metadata[variable] || ''}</td>
                  ))}
                  {selectedSummaryMeasures.flatMap((measure) => {
                    if (measure === "calc_distanceTravelled") {
                      const distanceValues = measures[measure] || [];
                      return [
                        <td key={`${measure}-totalProgression`}>
                          {distanceValues[0] ? formatValue(distanceValues[0][0], precision) : ''}
                        </td>,
                        <td key={`${measure}-totalAll`}>
                          {distanceValues[0] ? formatValue(distanceValues[0][1], precision) : ''}
                        </td>,
                        <td key={`${measure}-totalDuration`}>
                          {distanceValues[1] ? formatValue(distanceValues[1], precision) : ''}
                        </td>,
                        <td key={`${measure}-speedProgression`}>
                          {distanceValues[2] ? formatValue(distanceValues[2], precision) : ''}
                        </td>,
                        <td key={`${measure}-distancesProgression`}>
                          {distanceValues[3] && Array.isArray(distanceValues[3][0])
                            ? distanceValues[3][0].map((val) => formatValue(val, precision)).join("; ")
                            : ''}
                        </td>,
                        <td key={`${measure}-distancesAll`}>
                          {distanceValues[3] && Array.isArray(distanceValues[3][1])
                            ? distanceValues[3][1].map((val) => formatValue(val, precision)).join("; ")
                            : ''}
                        </td>,
                      ];
                    } else {
                      const values = measures[measure] || [''];
                      return Array.isArray(values)
                        ? values.map((v, i) => (
                            <td key={`${measure}-${i}`}>
                              {formatValue(v, precision, wholeNumberMeasures.includes(measure))}
                            </td>
                          ))
                        : <td>{formatValue(values, precision, wholeNumberMeasures.includes(measure))}</td>;
                    }
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