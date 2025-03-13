import React, { useState, useEffect } from 'react';
import './FRDRQuery.css';
import DataWindow from './components/DataWindow';
import FilterButtons from './components/FilterButtons';

const FRDRQuery = () => {
  // State to hold the database data returned by the API.
  const [data, setData] = useState([]);

  // For testing, we use some default filters.
  const defaultFilters = [
    { field: "trial_id", lookup: "lt", value: 110 },
    { field: "drugrx_drug1", lookup: "exact", value: "QNP" }
  ];

  //Specify the fields you want returned. Temp.
  const defaultFields = ["trial_id", "dateandtime", "drugrx_drug1", "duration"];
  
  // Function to call the QueryDataView API and pull data from the database.
  const fetchDatabaseData = async () => {
    try {
      const requestBody = {
        filters: defaultFilters,
        fields: defaultFields
      };

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
    fetchDatabaseData();
  }, []);

  return (
    <div>
      <h2>Filters</h2>
      <FilterButtons/>

      <h2>Filtered Data Entries</h2>
      <div className="dataEntries">
        <DataWindow data={data} />
      </div>
    </div>
  );
};

export default FRDRQuery;
