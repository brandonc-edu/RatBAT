import React, { useState, useEffect } from 'react';
import './FRDRQuery.css';
import DataWindow from './components/DataWindow';
import FilterButtons from './components/FilterButtons';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const FRDRQuery = () => {
  // State to hold the database data returned by the API.
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState([]);

  //TESTING, default filters
  const defaultFilters = [
    { field: "trial_id", lookup: "lt", value: 110 },
    { field: "drugrx_drug1", lookup: "exact", value: "QNP" }
  ];
  const emptyFilters = [{field: "trial_id", lookup: "lte", value: "1000"}];

  //TESTING, what filters I want
  const defaultFields = [  "trial_id",
    "dateandtime",
    "drugrx_drug1",
    "animalweight",
    "injectionnumber", 
    "oftestnumber", 
    "drugrxnumber", 
    "experimenter", 
    "duration", 
    "fallsduringtest", 
    "lightconditionsdesc", 
    "notes",
    "arenatypedesc",
    "projectdesc"
  ];

  // Called by FilterButtons "Apply"
  const handleApplyFilters = (appliedFilters) => {
    //console.log("Filters from UI:", appliedFilters);
    setFilters(appliedFilters);
    fetchQueryData(appliedFilters);
  };
  
  // Function to call the QueryDataView API and pull data from the database.
  const fetchQueryData = async (filters) => {
    try {
      const requestBody = {
        filters: filters,
        fields: defaultFields
      };

      console.log("Query requestBody", requestBody);

      const response = await fetch('http://ratbat.cas.mcmaster.ca/api/frdr-query/query-data/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Database data received:", result);
      
      setData(result);
      
    } catch (error) {
      console.error("Error fetching database data:", error);
    }
  };

  // Call the API once when the component mounts.
  useEffect(() => {
    fetchQueryData(emptyFilters);
  }, []);

  //Function to call FRDRQueryView API
  const handleFRDRQuery = async () => {
    try {
      const requestBody = {
        filters: filters, 
        cache_path: "database/data", 
        dtypes: "t" //p: path plot data, t: track file data
      };
      console.log("FRDR requestBody", requestBody);

      const response = await fetch('http://ratbat.cas.mcmaster.ca/api/frdr-query/frdr-query/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`FRDR API responded with status ${response.status}`);
      }

      const result = await response.json();
      console.log("FRDR data loaded:", result);
      alert("FRDR data loaded successfully!");
      // Backend caches trialIds in the db
    } catch (error) {
      console.error("Error fetching data from FRDR:", error);
      alert("Error loading data from FRDR.");
    }
  };
  
  //Function to handle downloading into a zip file with CSVs for each trial's timeseries
  const handleDownloadZip = async () => {
    try {
      // Extract trial_ids from the current data. (Assume that each data entry has a trial_id field)
      const trialIds = Array.from(new Set(data.map(item => item.trial_id)));
      if (trialIds.length === 0) {
        alert("No trial IDs available for download.");
        return;
      }
      // Build query string parameters for the get-timeseries view.
      const queryParams = trialIds.map(id => `trials=${id}`).join('&');
      const url = `http://ratbat.cas.mcmaster.ca/api/frdr-query/get-timeseries/?${queryParams}`;

      console.log("Fetching timeseries data from:", url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`get-timeseries API responded with status ${response.status}`);
      }
      const timeseriesData = await response.json();
      console.log("Timeseries data received:", timeseriesData);
      
      const zip = new JSZip();

      // For each trial_id, create a CSV file.
      trialIds.forEach(trialId => {
        // Convert trialId to string if necessary
        const records = timeseriesData[String(trialId)];
        console.log(`Trial ${trialId}:`, records);
        
        // Check if records is an object and has at least one key.
        if (records && typeof records === 'object' && Object.keys(records).length > 0) {
          // Determine the number of rows from one of the arrays.
          const numRows = records.sample_id.length;
          const csvHeaders = ['sample_id', 't', 'x', 'y']; // Adjust headers as needed.
          const csvRows = [csvHeaders.join(',')];
          
          // Loop over each index to build rows.
          for (let i = 0; i < numRows; i++) {
            const row = csvHeaders.map(header => records[header] ? records[header][i] : '');
            csvRows.push(row.join(','));
          }
          
          const csvContent = csvRows.join('\n');
          console.log(`Added CSV for trial ${trialId} with:`, csvContent);
          zip.file(`trial_${trialId}.csv`, csvContent);
        } else {
          console.log(`No valid records for trial ${trialId}`);
        }
      });

      // Generate the zip file as a blob and trigger download
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'timeseries_data.zip');
    } catch (error) {
      console.error("Error downloading zip:", error);
      alert("Error downloading zip file.");
    }
  };

  return (
    <div className="frdr-query">
      <div className="background">
        <h2>Filters</h2>
        <FilterButtons onApply={handleApplyFilters} />
          <button onClick={handleFRDRQuery}> Load Data from FRDR </button>
          <button onClick={handleDownloadZip}>Download Timeseries CSV</button>
        <h2>Filtered Data Entries</h2>
        <div className="dataEntries">
          <DataWindow data={data} />
        </div>
      </div>
    </div>
  );
};

export default FRDRQuery;