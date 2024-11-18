import React from 'react';
import './FilterButtons.css';

function FilterButtons({ filters, onChange }) {

  // Discrete Filter Options
  const discreteFilters = {
    category: ['Project', 'Study', 'Experiment', 'Trial'],
    color: ['Red', 'Green', 'Blue'],
  };

  // Discrete filter change handler
  const handleDropdownChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };
    onChange(newFilters);
  };

  // Typed input filter change handler
  const handleInputChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };
    onChange(newFilters);
  };

  return (
    <div>
      {/* Dropdown Discrete Filters */}
      {Object.entries(discreteFilters).map(([key, options]) => (
        <div key={key}>
          <label htmlFor={key}>{key}:</label>
          <select
            id={key}
            className = 'filter'
            value={filters[key] || ''}
            onChange={(e) => handleDropdownChange(key, e.target.value)}
          >
            <option value="">--Select {key}--</option>
            {options.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      ))}

      {/* Typed Input Filter */}
      <div>
        <label htmlFor="trial_id" >Trial ID:</label>
        <input
          type="number"
          className = 'filter'
          id="trial_id"
          value={filters.trial_id || ''}
          onChange={(e) => handleInputChange('trial_id', e.target.value)}
          placeholder="Enter Trial ID"
          min="1" // You can adjust restrictions as needed
        />
      </div>

      {/* Add more fields as necessary */}
    </div>
  );
}

export default FilterButtons;