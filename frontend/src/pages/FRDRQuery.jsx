// src/pages/FRDRQuery.jsx
import React, { useState,useEffect } from 'react';
import './FRDRQuery.css';
import DataWindow from './components/DataWindow';
import FilterButtons from './components/FilterButtons';

const FRDRQuery = () => {

    //Button Filter
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


    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch('/formatted_data_copy.json'); // Path to file in `public`
          const jsonData = await response.json();
          console.log('Fetched data:', jsonData);
          setData(jsonData);
        } catch (error) {
          console.error('Error loading the JSON data:', error);
        }
      };
  
      fetchData();
    }, []);

    //Filter Data
    useEffect(() => {
      const filteredEntries = data.filter(item =>
        Object.entries(filters).every(([key, value]) =>
          value ? item[key]?.toString().toLowerCase().includes(value.toLowerCase()) : true
        )
      );
      setFilteredData(filteredEntries);
    }, [data, filters]);


    // Toggle button state
    const handleToggle = (index) => {
        setToggledButtons((prevState) => {
        const newToggledButtons = [...prevState];
        newToggledButtons[index] = !newToggledButtons[index]; // Toggle state
        return newToggledButtons;
        });
    };

    // Handle filtering logic for data (filters -> aug data -> show data)
    const applyFilters = (newFilters) => {
      setFilters(newFilters);
    };

    return (
    <div>
        {/* FILTERBOX */}
        <h2>Filters</h2>
        <div className = 'filterBox'>
            <div className = 'parameters'>
                <FilterButtons filters={filters} onChange={applyFilters} toggledButtons={toggledButtons} />
            </div>
            <div className = 'metaVariables'>
                {metaButtons.map((btn, index) => (
                    <button 
                        key = {index}
                        className={`metaVar ${toggledButtons[index] ? 'toggled' : ''}`}
                        onClick={() => handleToggle(index)}
                    >    
                    {btn}</button>
                ))}
            </div>
        </div>
        <h2>Filtered Data Entries</h2>
        <div className = 'dataEntries'>
            <DataWindow data={filteredData} />
        </div>
    
    </div>
    )
};

export default FRDRQuery; 