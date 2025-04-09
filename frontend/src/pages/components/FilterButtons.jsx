import React, { useState } from 'react';
import './FilterButtons.css';

function FilterButtons({ categories, onApply }) {
  //Removed case sensitive lookups: (exact, contains, startswith, endswith)
  const lookupForText = [
    'iexact',  'icontains', 'istartswith', 'iendswith'
  ];

  const lookupDisplayMapping = {
    exact: "exact",
    iexact: "exact",
    contains: "contains",
    icontains: "contains",
    gt: ">",
    gte: ">=",
    lt: "<",
    lte: "<=",
    range: "range",
    startswith: "starts with",
    istartswith: "starts with",
    endswith: "ends with",
    iendswith: "ends with"
  };

  const lookupForNumber = [
    'exact', 'gt', 'gte', 'lt', 'lte', 'range'
  ];

  const lookupTime = [

  ]
  // State to track which category's filters are visible.
  const [toggledButtons, setToggledButtons] = useState(
    Array(categories.length).fill(false)
  );

  // Structure: { [category]: { [field]: { lookup, value } }, ... }
  const [localFilters, setLocalFilters] = useState({});

  // Toggle visibility of a category.
  const toggleCategory = (index) => {
    setToggledButtons(prev => {
      const newToggled = [...prev];
      newToggled[index] = !newToggled[index];
      return newToggled;
    });
  };

  // Update the filter value for a specific category and field.
  const handleFieldChange = (category, field, newValue) => {
    setLocalFilters(prev => {
      // Copy existing category filters or start empty
      const categoryFilters = { ...(prev[category] || {}) };
      // If there's an existing object, reuse its lookup. Otherwise default to 'exact'.
      const existingField = categoryFilters[field] || { lookup: 'exact', value: '' };

      if (newValue.trim() === '') {
        // If the user clears the input, remove the field entirely
        delete categoryFilters[field];
      } else {
       
        categoryFilters[field] = {
          lookup: existingField.lookup,
          value: newValue
        };
      }

      return {
        ...prev,
        [category]: categoryFilters
      };
    });
  };

  const handleRangeChange = (category, field, bound, newValue) => {
    // bound is either 'min' or 'max'
    setLocalFilters(prev => {
      const categoryFilters = { ...(prev[category] || {}) };
      const existingField = categoryFilters[field] || { lookup: 'range', value: { min: '', max: '' } };
      
      // store { lookup, value: { min, max } }
      const updatedValue = { ...(existingField.value || { min: '', max: '' }) };
      updatedValue[bound] = newValue; // set the min or max
  
      categoryFilters[field] = {
        lookup: 'range',
        value: updatedValue
      };
      return {
        ...prev,
        [category]: categoryFilters
      };
    });
  };

  const handleLookupChange = (category, field, lookup) => {
    setLocalFilters(prev => {
      const current = prev[category] || {};
      const currentField = current[field] || { lookup: 'exact', value: '' };
      return {
        ...prev,
        [category]: {
          ...current,
          [field]: { ...currentField, lookup }
        }
      };
    });
  };  

  // For discrete fields, update the value from the select.
  const handleDiscreteChange = (category, field, value) => {
    setLocalFilters(prev => {
      const current = prev[category] || {};
      return {
        ...prev,
        [category]: {
          ...current,
          [field]: { lookup: 'exact', value } 
        }
      };
    });
  };
  // Handle custom input if "Other" is selected.
  const handleDiscreteCustomChange = (category, field, value) => {
    setLocalFilters(prev => {
      const current = prev[category] || {};
      return {
        ...prev,
        [category]: {
          ...current,
          [field]: { lookup: 'exact', value }
        }
      };
    });
  };


  const handleApply = () => {
    //Before passing, transform filters into an array format for API call
    const filtersArray = [];
    for (const category in localFilters){
      for (const field in localFilters[category]){
        const { lookup, value } = localFilters[category][field];
        if (lookup === 'range') {
          const min = value.min?.trim();
          const max = value.max?.trim();

          //Note: For range lookup, if min or max is missing change to gte, lte. Not sure if this proper but working.
          if (min && max) {
            filtersArray.push({
              field: field,
              lookup: 'range',
              value: [min, max]
            });
          } else if (min) {
            filtersArray.push({
              field: field,
              lookup: 'gte',
              value: min
            });
          } else if (max) {
            filtersArray.push({
              field: field,
              lookup: 'lte',
              value: max
            });
          }
        } else {
          
          if (value.trim() === '') continue;
          filtersArray.push({
            field: field,
            lookup: lookup,
            value: value
          });
        }
      }
    }
    
    console.log("handleApply", filtersArray);
    onApply(filtersArray);
  };

  return (
    <div className="filter-buttons">
      <div className="filterBox">
        <div className="parameters">
          {categories.map((group, index) => (
            toggledButtons[index] && (
              <div key={group.category} className="filter-group">
                <h3>{group.displayName || group.category}</h3>
                {group.fields.map(field => {
                  // For discrete fields, render a select with preset options and an "Other" option.
                  if (field.type === "discrete") {
                    const fieldData = localFilters[group.category]?.[field.name] || { value: '' };
                    return (
                      <div key={field.name} className="filter-item">
                        <label className="filter-item-label-discrete">{field.name}:</label>
                        <select
                          value={fieldData.value}
                          onChange={(e) => handleDiscreteChange(group.category, field.name, e.target.value)}
                        >
                          <option value="">None</option>
                          {field.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                          <option value="other">Other</option>
                        </select>
                        {fieldData.value === 'other' && (
                          <input
                            type="text"
                            placeholder="Enter custom value"
                            onChange={(e) => handleDiscreteCustomChange(group.category, field.name, e.target.value)}
                          />
                        )}
                      </div>
                    );
                  } else {
                    // For non-discrete fields, render a lookup dropdown and an input.
                    const lookupOptions = (field.type === "number" || field.type === "time")
                      ? lookupForNumber
                      : lookupForText;
                    const fieldData = localFilters[group.category]?.[field.name] || { lookup: 'exact', value: '' };
                    return (
                      <div key={field.name} className="filter-item">
                        <label>{field.displayName || field.name}:</label>
                        <select
                          value={fieldData.lookup}
                          onChange={(e) => handleLookupChange(group.category, field.name, e.target.value)}
                        >
                          {lookupOptions.map(opt => (
                            <option key={opt} value={opt}>
                              {lookupDisplayMapping[opt] || opt}
                            </option>
                          ))}
                        </select>
                        {fieldData.lookup === 'range' ? (
                          <div>
                            <input
                              type="number"
                              placeholder="Min"
                              value={fieldData.value?.min || ''}
                              onChange={(e) => handleRangeChange(group.category, field.name, 'min', e.target.value)}
                            />
                            <input
                              type="number"
                              placeholder="Max"
                              value={fieldData.value?.max || ''}
                              onChange={(e) => handleRangeChange(group.category, field.name, 'max', e.target.value)}
                            />
                          </div>
                        ) : (
                          <input
                            type={field.type === "number" ? "number" : "text"}
                            value={typeof fieldData.value === 'string' ? fieldData.value : ''}
                            onChange={(e) => handleFieldChange(group.category, field.name, e.target.value)}
                          />
                        )}
                      </div>
                    );
                  }
                })}
              </div>
            )
          ))}
        </div>
        <div className="meta-buttons">
          {categories.map((group, index) => (
            <button
              key={group.category}
              className={`metaVar ${toggledButtons[index] ? 'toggled' : ''}`}
              onClick={() => toggleCategory(index)}
            >
              {group.displayName || group.category}
            </button>
          ))}
        </div>
      </div>
      <button onClick={handleApply}>Apply</button>
    </div>
  );
}

export default FilterButtons;