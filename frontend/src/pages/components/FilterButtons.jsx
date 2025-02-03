import React from 'react';
import './FilterButtons.css';

function FilterButtons({ filters, onChange, toggledButtons }) {

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
  // const discreteFilters = {
  //   SUBJECTS_LightDarkCycleWhenTested: ['lights ON','lights OFF'],
  //   SUBJECTS_LightDarkCycleInColonyRoom: ['Lights ON 7 AM to 7 PM', 'Lights OFF 7 PM to 7 AM'], 
  //   APPARATUS_ArenaType: ['160x160 cm table surface on 60 cm high legs', 'Plexiglas box 40x40x35 cm'], 
  //   APPARATUS_ArenaID: ['OF #1 in room U59_south', 'OF #2 in room U59_north','OF #3 in room U60_south','OF #4 in room U60_north','Circular arena in room EPM_room','Activity box in room ActivityMonitorCages_room'],
  //   TREATMENT_DrugRx_Drug1: ['QNP', 'SAL'], 
  //   TREATMENT_DrugRx_Dose1: ['0','0.5']
  // };

  const discreteFilters = {
    "Light/Dark Cycle": ['lights ON', 'lights OFF'],
    "Arena Type": ['160x160 cm table surface on 60 cm high legs', 'Plexiglas box 40x40x35 cm'],
    "Arena ID": ['OF #1 in room U59_south', 'OF #2 in room U59_north'],
    "Drug Treatment": ['QNP', 'SAL'],
    "Dose": ['0', '0.5'],
    "Date": [],
    "Trial Duration": [],
    "Project Label": [],
    "Study Title": [],
    "Room Light Condition": ['room ILLUMINATED (fluorescent lights ON)'],
    "Body Weight": [],
    "Trial Type": ['Standard OF trial'],
    "What Objects": ['Trackfile+Pathplot+Video'],
    "Track Duration": [],
    "Experimenter": []
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
      {Object.entries(discreteFilters).map(([key, options], index) => {
        // Log state for debugging
        console.log(`Filter: ${key}, Toggled: ${toggledButtons[index]}`);
        return toggledButtons[index] ? (
            <div key={key}>
                <label htmlFor={key}>{key}:</label>
                <select
                    id={key}
                    className='filter'
                    value={filters[key] || ''}
                    onChange={(e) => handleDropdownChange(key, e.target.value)}
                >
                    <option value="">--Select {key}--</option>
                    {options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </div>
        ) : null;
      })}
      {/* Typed Input Filter Example
      <div>
        <label htmlFor="APPARATUS_ArenaType_number">APPARATUS_ArenaType_number:</label>
        <input
          type="number"
          className='filter'
          value={filters.APPARATUS_ArenaType_number || ''}
          onChange={(e) => handleInputChange('APPARATUS_ArenaType_number', e.target.value)}
          placeholder="Enter Value"
          min="1" // You can adjust restrictions as needed
        />
      </div> */}

    </div>
  );
}

export default FilterButtons;