import React, { useState } from 'react';
import './FilterButtons.css';

function FilterButtons({ initialFilters, onApply, toggledButtons }) {
  // Combined configuration for both discrete and continuous filters.
  const filterConfig = {
    "Light/Dark Cycle": { type: "discrete", options: ['lights ON', 'lights OFF'] },
    "Arena Type": { type: "discrete", options: ['160x160 cm table surface on 60 cm high legs', 'Plexiglas box 40x40x35 cm'] },
    "Arena ID": { type: "discrete", options: ['OF #1 in room U59_south', 'OF #2 in room U59_north'] },
    "Drug Treatment": { type: "discrete", options: ['QNP', 'SAL'] },
    "Dose": { type: "discrete", options: ['0', '0.5'] },
    "Date": { type: "continuous", inputType: "date" },
    "Trial Duration": { type: "continuous", inputType: "number", placeholder: "minutes" },
    "Project Label": { type: "discrete", options: [] },
    "Study Title": { type: "discrete", options: [] },
    "Room Light Condition": { type: "discrete", options: ['room ILLUMINATED (fluorescent lights ON)'] },
    "Body Weight": { type: "continuous", inputType: "number", placeholder: "kg" },
    "Trial Type": { type: "discrete", options: ['Standard OF trial'] },
    "What Objects": { type: "discrete", options: ['Trackfile+Pathplot+Video'] },
    "Track Duration": { type: "continuous", inputType: "number", placeholder: "seconds" },
    "Experimenter": { type: "discrete", options: [] }
  };

  // Use the keys (filter names) to define the order—this should match your metaButtons order.
  const metaButtonsOrder = Object.keys(filterConfig);

  // Local state to hold filter values until applied.
  const [localFilters, setLocalFilters] = useState(initialFilters || {});

  // Handlers for updating filter state.
  const handleDiscreteChange = (filterKey, value) => {
    setLocalFilters(prev => ({ ...prev, [filterKey]: value }));
  };

  const handleContinuousChange = (filterKey, bound, value) => {
    const currentRange = localFilters[filterKey] || { min: '', max: '' };
    const newRange = { ...currentRange, [bound]: value };
    setLocalFilters(prev => ({ ...prev, [filterKey]: newRange }));
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  return (
    <div className="filters">
      {metaButtonsOrder.map((filterKey, index) => {
        // Use toggledButtons to decide whether to render this filter.
        if (!toggledButtons[index]) return null;
        const config = filterConfig[filterKey];

        return (
          <div key={filterKey} className="filter-item">
            <label>{filterKey}:</label>
            {config.type === "discrete" ? (
              <select
                value={localFilters[filterKey] || ''}
                onChange={(e) => handleDiscreteChange(filterKey, e.target.value)}
              >
                <option value="">--Select {filterKey}--</option>
                {config.options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : config.type === "continuous" ? (
              <div className="continuous-inputs">
                <input
                  type={config.inputType}
                  placeholder="Min"
                  value={(localFilters[filterKey] && localFilters[filterKey].min) || ''}
                  onChange={(e) => handleContinuousChange(filterKey, 'min', e.target.value)}
                />
                <input
                  type={config.inputType}
                  placeholder="Max"
                  value={(localFilters[filterKey] && localFilters[filterKey].max) || ''}
                  onChange={(e) => handleContinuousChange(filterKey, 'max', e.target.value)}
                />
              </div>
            ) : null}
          </div>
        );
      })}
      <button onClick={handleApply}>Apply</button>
    </div>
  );
}

export default FilterButtons;
