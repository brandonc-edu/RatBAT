import React from 'react';
import './FilterButtons.css';

function FilterButtons({ filters, onChange }) {

  //Animal 
  // lightColonyDesc
  // lightCycleTest

  //Apparatus
  // arenaLocDesc discrete
  // arenaTypeDesc discrete
  // arenaObjectDesc 

  //Treatment
  // drug1 discrete
  // dose1 discrete

  
  // Discrete Filter Options
  const discreteFilters = {
    lightColonyDesc: ['Lights ON 7 AM to 7 PM', 'Lights OFF 7 PM to 7 AM'], // Example values
    arenaTypeDesc: ['160x160 cm table', 'Plexiglas box'], // Example values
    drug1: ['QNP', 'clorgyline'], // Example values
  };

  // Discrete filter change handler
  const handleDropdownChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };
    console.log('Updated Filters:', newFilters); // Debugging log
    onChange(newFilters);
  };

  // Typed input filter change handler
  const handleInputChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };
    console.log('Updated Filters:', newFilters); // Debugging log
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

      {/* Typed Input Filter Example */}
      <div>
        <label htmlFor="trial_id">Trial ID:</label>
        <input
          type="number"
          className='filter'
          id="trial_id"
          value={filters.trial_id || ''}
          onChange={(e) => handleInputChange('trial_id', e.target.value)}
          placeholder="Enter Trial ID"
          min="1" // You can adjust restrictions as needed
        />
      </div>

    </div>
  );
}

export default FilterButtons;