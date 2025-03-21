import React, { useState, useEffect } from 'react';
import './FRDRQuery.css';
import DataWindow from './components/DataWindow';
import FilterButtons from './components/FilterButtons';

const FRDRQuery = () => {
  // State to hold the database data returned by the API.
  const [data, setData] = useState([]);

  //TESTING, default filters
  const defaultFilters = [
    { field: "trial_id", lookup: "lt", value: 110 },
    { field: "drugrx_drug1", lookup: "exact", value: "QNP" }
  ];
  const emptyFilters = [{field: "trial_id", lookup: "gte", value: "0"}];

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
    "arenatypedesc"
  ];
  
  // Function to call the QueryDataView API and pull data from the database.
  const fetchQueryData = async (filters) => {
    try {
      const requestBody = {
        filters: filters,
        fields: defaultFields
      };

      console.log("requestBody", requestBody);

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
    fetchQueryData();
  }, []);

  return (
    <div className = "background">
      <h2>Filters</h2>
      <FilterButtons onApply={fetchQueryData}/>

      <h2>Filtered Data Entries</h2>
      <div className="dataEntries">
        <DataWindow data={data} />
      </div>
    </div>
  );
};

export default FRDRQuery;
