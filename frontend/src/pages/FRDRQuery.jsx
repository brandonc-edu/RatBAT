import React, { useState, useEffect } from 'react';
import './FRDRQuery.css';
import DataWindow from './components/DataWindow';
import FilterButtons from './components/FilterButtons';
import FieldSelector from './components/FieldSelector';
import { categories } from '../config/categories';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const FRDRQuery = () => {

   //TESTING, default filters
   const defaultFilters = [
    { field: "trial_id", lookup: "lt", value: 110 },
    { field: "drugrx_drug1", lookup: "exact", value: "QNP" }
  ];
  const emptyFilters = [{field: "trial_id", lookup: "lte", value: "10"}];

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


  // State to hold the database data returned by the API.
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [selectedFields, setSelectedFields] = useState(defaultFields);
  const [showFieldSelector, setShowFieldSelector] = useState(false);

 
  // Called by FilterButtons "Apply"
  const handleApplyFilters = (appliedFilters) => {
    //console.log("Filters from UI:", appliedFilters);
    setFilters(appliedFilters);
    fetchQueryData(appliedFilters, selectedFields);
  };

  // Called by FieldSelector to update selected fields.
  const handleFieldSelection = (fields) => {
    if (!fields.includes("trial_id")) { //Double check trial id is in fields.
      fields.push("trial_id");
    }
    setSelectedFields(fields);
  };  
  
  // Function to call the QueryDataView API and pull data from the database.
  const fetchQueryData = async (filters, fields) => {
    try {
      
      if (filters.length == 0){
        alert("No trial IDs available for download.");
        return;
      }

      const requestBody = {
        filters: filters,
        fields: selectedFields.length > 0 ? selectedFields : defaultFields
      };

      console.log("Query requestBody", requestBody);

      const response = await fetch('/api/frdr-query/query-data/', {
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
  // useEffect(() => {
  //   //fetchQueryData(emptyFilters);
  // }, []);

  //Function to call FRDRQueryView API
  const handleFRDRQuery = async () => {
    if (loading) return;
    try {

      if (filters.length == 0){
        alert("No filters selected.");
        return;
      }

      setLoading(true);
      const requestBody = {
        filters: filters, 
        cache_path: "database/data", 
        dtypes: "t" //p: path plot data, t: track file data
      };
      console.log("FRDR requestBody", requestBody);

      const response = await fetch('/api/frdr-query/frdr-query/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`FRDR API responded with status ${response.status}`);
      }

      const result = await response.json();
      console.log("FRDR data loaded:", result);

      // FRDR cannot handle large file loads so include partial success to notify users
      if (result.message && result.message.includes("One or more files failed to download.")) {
        if (result["failed downloads"] && result["failed downloads"].length > 0) {
          const failedList = result["failed downloads"]
            .map(([trialId, dtype]) => `Trial ${trialId}, type: ${dtype}`)
            .join("\n");
          
          alert(`Some files failed to download:\n${failedList}`);
        }
      }
      else{
        alert("FRDR data loaded successfully!");
      }
      
    } catch (error) {
      console.error("Error fetching data from FRDR:", error);
      alert("Error loading data from FRDR.");
    }

    setLoading(false);
  };
  
  //Function to handle downloading into a zip file with CSVs for each trial's timeseries
  const handleDownloadZip = async () => {
    if (loading) return;
    try {
      
      //Run frdr-query api call first to load into database. ugly.
      try{
        await handleFRDRQuery();
      } catch(error){
        return;
      }

      setLoading(true);

      const trialIds = Array.from(new Set(data.map(item => item.trial_id)));
      if (trialIds.length === 0) {
        alert("No trial IDs available for download.");
        setLoading(false);
        return;
      }

      const queryParams = trialIds.map(id => `trials=${id}`).join('&');
      const url = `/api/frdr-query/get-timeseries/?${queryParams}`;

      console.log("Fetching timeseries data from:", url);
      const response = await fetch(url, { method: 'GET' } );

      if (!response.ok) {
        throw new Error(`get-timeseries API responded with status ${response.status}`);
      }

      let timeseriesData = await response.json();
      console.log("Timeseries data received:", timeseriesData);
    
      const zip = new JSZip();

      
      trialIds.forEach(trialId => {
        const records = timeseriesData[String(trialId)];
        //console.log(`Trial ${trialId}:`, records);
        
        if (records && typeof records === 'object' && Object.keys(records).length > 0) {
          const numRows = records.sample_id.length;
          const csvHeaders = ['sample_id', 't', 'x', 'y'];
          const csvRows = [csvHeaders.join(',')];
          
        
          for (let i = 0; i < numRows; i++) {
            const row = csvHeaders.map(header => records[header] ? records[header][i] : '');
            csvRows.push(row.join(','));
          }
          
          const csvContent = csvRows.join('\n');
          console.log(`Added CSV for trial ${trialId}`); //with:`, csvContent);
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
    setLoading(false);
  };

  return (
    <div className="frdr-query">
      {loading && (
        <div className = "loading-screen">
          <div className = "spinny"></div>
          <p> Loading...</p>  
        </div>
      )}
      <h2>Filters</h2>
      <FilterButtons categories = {categories} onApply={handleApplyFilters} />
      <button className="select-fields" onClick={() => setShowFieldSelector(true)}>
          Select Fields
      </button>
      {showFieldSelector && (
        <FieldSelector
          availableFields={categories.flatMap(cat => cat.fields)}
          onChange={handleFieldSelection}
          onClose={() => setShowFieldSelector(false)}
          initialSelected = {selectedFields}
        />
      )}

      <button className = "frdr-button" onClick={handleDownloadZip}>Download Timeseries CSV</button>
      <button className = "frdr-button" onClick={handleFRDRQuery}> Load Data from FRDR </button>
      <h2 className = "filtered-data-entries">Filtered Data Entries</h2>
      <DataWindow data={data} />

    </div>
  );
};

export default FRDRQuery;