import React, { useState, useEffect } from 'react';
import './FRDRQuery.css';
import DataWindow from './components/DataWindow';
import FilterButtons from './components/FilterButtons';

const FRDRQuery = () => {
  // State to hold available field configurations from GetFieldsView.
  const [availableFields, setAvailableFields] = useState([]);
  // Filter criteria to be sent to QueryDataView.
  const [filters, setFilters] = useState({});
  // Data returned from QueryDataView.
  const [filteredData, setFilteredData] = useState([]);
  // Toggled state for each filter button; initially, all false.
  const [toggledButtons, setToggledButtons] = useState([]);

  // Fetch available fields dynamically from GetFieldsView.
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await fetch('/api/get-fields/');
        const json = await response.json();
        console.log("Available fields:", json);
        // Assume the response has a property "fields" which is an array of field configs.
        setAvailableFields(json.fields || []);
        // Initialize toggledButtons to false for each available field.
        setToggledButtons(Array((json.fields || []).length).fill(false));
      } catch (error) {
        console.error("Error fetching available fields:", error);
      }
    };
    fetchFields();
  }, []);

  // When filters are applied, use QueryDataView to fetch the filtered data.
  const applyFilters = async (newFilters) => {
    console.log("New filters applied:", newFilters);
    setFilters(newFilters);
    try {
      // Build the request payload.
      const requestBody = {
        filters: newFilters,
        // Send the list of field names (from availableFields) that you want returned.
        fields: availableFields.map(field => field.name)
      };
      const response = await fetch('/api/query-data/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        throw new Error(`QueryDataView responded with status ${response.status}`);
      }
      const result = await response.json();
      console.log("Filtered data result:", result);
      setFilteredData(result.data || []);
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    }
  };

  // Handle downloading FRDR data via FRDRQueryView.
  const handleDownload = async () => {
    const requestBody = {
      filters: filters,
      cache_path: "cache/downloaded_data",  // CACHE PATH
      dtypes: "a"
    };
    try {
      const response = await fetch('/api/frdr-query/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        throw new Error(`FRDRQueryView responded with status ${response.status}`);
      }
      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error("Error downloading FRDR data:", error);
      alert("Error downloading FRDR data: " + error.message);
    }
  };

  // Toggle a filter’s visibility based on the availableFields order.
  const handleToggle = (index) => {
    setToggledButtons(prev => {
      const newToggled = [...prev];
      newToggled[index] = !newToggled[index];
      return newToggled;
    });
  };

  return (
    <div>
      <h2>Filters</h2>
      <FilterButtons
        filters={filters}
        onApply={applyFilters} 
        toggledButtons={toggledButtons}
      />

      <button onClick={handleDownload}>Download FRDR Data</button>

      <h2>Filtered Data Entries</h2>
      <div className="dataEntries">
        <DataWindow data={filteredData} />
      </div>
    </div>
  );
};

export default FRDRQuery;
