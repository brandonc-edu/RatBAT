import React, { useState, useEffect } from 'react';
import './FRDRQuery.css';
import DataWindow from './components/DataWindow';
import FilterButtons from './components/FilterButtons';

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

      const response = await fetch('http://ratbat.cas.mcmaster.ca/api/query-data/', {
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

      const response = await fetch('http://ratbat.cas.mcmaster.ca/api/frdr-query/', {
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

  return (
    <div className="frdr-query">
      <div className="background">
        <h2>Filters</h2>
        <FilterButtons onApply={handleApplyFilters} />
          <button onClick={handleFRDRQuery}>
            Load Data from FRDR
          </button>
        <h2>Filtered Data Entries</h2>
        <div className="dataEntries">
          <DataWindow data={data} />
        </div>
      </div>
    </div>
  );
};

export default FRDRQuery;