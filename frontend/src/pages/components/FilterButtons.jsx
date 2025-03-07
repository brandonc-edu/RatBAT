import React, { useState } from 'react';
import './FilterButtons.css';

function FilterButtons({ initialFilters, onApply, toggledButtons, availableFields }) {
  // Build a configuration object based on availableFields.
  // We assume each field object has: name, displayName, type ("discrete" or "continuous"), and optionally options.
  const filterConfig = {};
  availableFields.forEach(field => {
    const key = field.displayName || field.name;
    filterConfig[key] = {
      type: field.type, 
      options: field.options || [],
      // For continuous fields, you can pass an inputType (e.g., "date" or "number").
      inputType: field.inputType || (field.type === "continuous" ? "number" : null)
    };
  });

  // The order of filters follows the order of availableFields.
  const metaButtonsOrder = availableFields.map(field => field.displayName || field.name);

  // Local state to hold filter values until Apply is clicked.
  const [localFilters, setLocalFilters] = useState(initialFilters || {});

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
