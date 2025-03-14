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
  const defaultFields = ["trial_id", "dateandtime", "drugrx_drug1", "duration"];
  
  // Function to call the QueryDataView API and pull data from the database.
  const fetchQueryData = async (filters) => {
    console.log("Filters received:", filters);
    //Transform filters array format expected by API
    const filtersArray = [];
    if (filters == undefined || filters.length == 0){
      filtersArray.push({field: "trial_id", lookup: "gte", value: "0"});
    }
    else{
      for (const category in filters) {
        const fieldsObj = filters[category];
        for (const field in fieldsObj) {
          const value = fieldsObj[field];
          filtersArray.push({
            field: field,
            lookup: "exact", //Implement dynamic lookup later.
            value: value
          });
        }
      }
    };
    
    console.log("Formated filters:", filtersArray);
    try {
      const requestBody = {
        filters: filtersArray,
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
    fetchQueryData();
  }, []);

  return (
    <div>
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
