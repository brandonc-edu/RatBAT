import React, { useState, useEffect } from 'react';
import './FRDRQuery.css';
import DataWindow from './components/DataWindow';
import FilterButtons from './components/FilterButtons';

const FRDRQuery = () => {
  // Metavariable Filter
  const [data, setData] = useState([]);
  const metaButtons = [
    "Light/Dark Cycle",
    "Arena Type",
    "Arena ID",
    "Drug Treatment",
    "Dose",
    "Date",
    "Trial Duration",
    "Project Label",
    "Study Title",
    "Room Light Condition",
    "Body Weight",
    "Trial Type",
    "What Objects",
    "Track Duration", 
    "Experimenter"
  ];

  // Data filtering states
  const [filters, setFilters] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  // State to track toggled buttons (using an array of boolean values)
  const [toggledButtons, setToggledButtons] = useState(Array(metaButtons.length).fill(false));

  // // Fetch data from API based on filters
  // useEffect(() => {
  //   // Only fetch if required parameters are available
  //   const fetchDataFromAPI = async () => {
  //     try {
  //       // Build the request body with your current filters and any additional required parameters
  //       const requestBody = {
  //         filters: filters,
  //         cache_path: "cache/TBD.json", // Make sure to do this later
  //         dtypes: "a",
  //         save: true
  //       };

  //       const response = await fetch('/api/query-data/', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify(requestBody)
  //       });

  //       if (!response.ok) {
  //         throw new Error(`API responded with status ${response.status}`);
  //       }
        
  //       const result = await response.json();
  //       console.log('API response:', result);

  //     } 
  //     catch (error) {
  //       console.error('Error fetching data from API:', error);
  //     }
  //   };

  //   fetchDataFromAPI();
  // }, [filters]);

  // TEMPORARY: Load local JSON file
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/formatted_data_copy.json'); 
        const jsonData = await response.json();
        console.log('Fetched local data:', jsonData);
        setData(jsonData);
      } catch (error) {
        console.error('Error loading local JSON data:', error);
      }
    };
    fetchData();
  }, []);

  // Apply filters to data when filters are updated via Apply button (Im going to cry)
  useEffect(() => {
    // Map human‑readable filter keys to your JSON keys
    const keyMapping = {
      "Light/Dark Cycle": "SUBJECTS_LightDarkCycleWhenTested",
      "Arena Type": "APPARATUS_ArenaType",
      "Arena ID": "APPARATUS_ArenaID",
      "Drug Treatment": "TREATMENT_DrugRx_Drug1",
      "Dose": "TREATMENT_DrugRx_Dose1",
      "Date": "TRIAL_DateAndTime",
      "Trial Duration": "TRIAL_duration",
      "Project Label": "QSTUDYinfo_Project_label",
      "Study Title": "QSTUDYinfo_StudyTitle",
      "Room Light Condition": "APPARATUS_ArenaTestingRoomLightCondition",
      "Body Weight": "SUBJECTS_RatUniqueID_BodyWeightAtTRIAL",
      "Trial Type": "TRIALinfo_TypeOfEvent",
      "What Objects": "TRIALinfo_WhatObjectsAvailable",
      "Track Duration": "RAWDATA_TrackFileForTrial_Trackduration",
      "Experimenter": "TRIALinfo_Experimenter"
    };

    console.log("Applied filters:", filters);

    const filteredEntries = data.filter(item => {
      for (const filterKey in filters) {
        const filterVal = filters[filterKey];
        if (filterVal) {
          // Get the correct key from the mapping
          const dataKey = keyMapping[filterKey] || filterKey;
          const itemVal = item[dataKey];
          console.log(
            `Checking "${filterKey}" (data key: "${dataKey}") - item value:`,
            itemVal,
            " filter value:",
            filterVal
          );

          // Check if this is a continuous filter (with a range)
          if (typeof filterVal === 'object' && ('min' in filterVal || 'max' in filterVal)) {
            // Special handling if the filter is for dates
            if (filterKey === "Date") {
              const itemDate = new Date(itemVal);
              if (filterVal.min && itemDate < new Date(filterVal.min)) return false;
              if (filterVal.max && itemDate > new Date(filterVal.max)) return false;
            } else {
              // Convert to numbers for other continuous filters
              const numericItemVal = parseFloat(itemVal);
              if (filterVal.min && numericItemVal < parseFloat(filterVal.min)) return false;
              if (filterVal.max && numericItemVal > parseFloat(filterVal.max)) return false;
            }
          } else {
            // For discrete filters, perform a case-insensitive substring match
            if (!itemVal?.toString().toLowerCase().includes(filterVal.toString().toLowerCase())) {
              return false;
            }
          }
        }
      }
      return true;
    });

    console.log("Filtered entries:", filteredEntries);
    setFilteredData(filteredEntries);
  }, [data, filters]);

  // Toggle button state
  const handleToggle = (index) => {
    setToggledButtons(prevState => {
      const newToggledButtons = [...prevState];
      newToggledButtons[index] = !newToggledButtons[index];
      return newToggledButtons;
    });
  };

  // Handle filtering logic for data (filters -> update data or trigger API call)
  const applyFilters = (newFilters) => {
    console.log("New filters applied:", newFilters);
    setFilters(newFilters);
  };

  return (
    <div>
      {/* FILTERBOX */}
      <h2>Filters</h2>
      <FilterButtons
        filters={filters}
        onApply={applyFilters} 
        toggledButtons={toggledButtons}
      />


      <h2>Filtered Data Entries</h2>
      <div className='dataEntries'>
        <DataWindow data={filteredData} />
      </div>
    </div>
  );
  };

  export default FRDRQuery;
