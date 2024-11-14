// src/pages/FRDRQuery.jsx
import React, { useState } from 'react';
import './FRDRQuery.css';
import DataWindow from './components/DataWindow';
import FilterButtons from './components/FilterButtons';

const sampleData = [
    { id: 1, category: 'Fruit', name: 'Apple', color: 'Red' },
    { id: 2, category: 'Fruit', name: 'Banana', color: 'Yellow' },
    { id: 3, category: 'Vegetable', name: 'Carrot', color: 'Orange' },
    { id: 4, category: 'Vegetable', name: 'Spinach', color: 'Green' },
  ];
  


const FRDRQuery = () => {
    const metaButtons = ['var1', 'var2', 'var3', 'var3', 'var5'];

    const [filters, setFilters] = useState({});
    const [filteredData, setFilteredData] = useState(sampleData);

    const applyFilters = (newFilters) => {
        setFilters(newFilters);
        const filteredEntries = sampleData.filter(item =>
          Object.entries(newFilters).every(([key, value]) =>
            value ? item[key] === value : true
          )
        );
        setFilteredData(filteredEntries);
    };

    return (
    <div>
        {/* FILTERBOX */}
        <h2>FILTERS</h2>
        <div className = 'filterBox'>
            <div className = 'parameters'>
                <FilterButtons filters={filters} onChange={applyFilters} />
            </div>
            <div className = 'metaVariables'>
                <div>Metavariables</div>
                {metaButtons.map((btn) => {
                    return <button class = 'metaVar'>{btn}</button>;
                })}
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