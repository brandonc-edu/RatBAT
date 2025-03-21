import React, { useState } from 'react';
import './FilterButtons.css';

function FilterButtons({ onApply }) {
  const categories = [
    {
        category: "lightcyclecolony",
        displayName: "Light Cycle Colony",
        fields: [
          { name: "lightcyclecolony_id", type: "number" },
          { name: "lightcyclecolonydesc", type: "text" }
        ]
    },
    {
        category: "lightcycletest",
        displayName: "Light Cycle Test",
        fields: [
          { name: "lightcycletest_id", type: "number" },
          { name: "lightcycletestdesc", type: "text" }
        ]
    },
    {
        category: "arenatype",
        displayName: "Arena Type",
        fields: [
          { name: "arenatype_id", type: "number" },
          { name: "arenatypedesc", type: "discrete",
            options: ["Option A", "Option B", "Option C"]
           }
        ]
    },
    {
        category: "arenaloc",
        displayName: "Arena Location",
        fields: [
          { name: "arenaloc_id", type: "number" },
          { name: "arenalocdesc", type: "text" }
        ]
    },
    {
        category: "arenaobjects",
        displayName: "Arena Objects",
        fields: [
          { name: "arenaobjects_id", type: "number" },
          { name: "arenaobjectsdesc", type: "text" }
        ]
    },
    {
        category: "lightconditions",
        displayName: "Light Conditions",
        fields: [
          { name: "lightconditions_id", type: "number" },
          { name: "lightconditionsdesc", type: "text" }
        ]
    },
    {
        category: "surgerymanipulation",
        displayName: "Surgery Manipulation",
        fields: [
          { name: "surgerymanipulation_id", type: "number" },
          { name: "surgerymanipulationdesc", type: "text" }
        ]
    },
    {
        category: "surgeryoutcome",
        displayName: "Surgery Outcome",
        fields: [
          { name: "surgeryoutcome_id", type: "number" },
          { name: "surgeryoutcomedesc", type: "text" }
        ]
    },
    {
        category: "eventtype",
        displayName: "Event Type",
        fields: [
          { name: "eventtype_id", type: "number" },
          { name: "eventtypedesc", type: "text" }
        ]
    },
    {
        category: "animal",
        displayName: "Animal",
        fields: [
          { name: "animal_id", type: "number" }
        ]
    },
    {
        category: "apparatus",
        displayName: "Apparatus",
        fields: [
          { name: "apparatus_id", type: "number" }
        ]
    },
    {
        category: "treatment",
        displayName: "Treatment",
        fields: [
          { name: "treatment_id", type: "number" },
          { name: "drugrx_drug1", type: "text" },
          { name: "drugrx_dose1", type: "number" },
          { name: "drugrx_drug2", type: "text" },
          { name: "drugrx_dose2", type: "number" },
          { name: "drugrx_drug3", type: "text" },
          { name: "drugrx_dose3", type: "number" }
        ]
    },
    {
        category: "trial",
        displayName: "Trial",
        fields: [
          { name: "trial_id", type: "number" },
          { name: "dateandtime", type: "datetime" },
          { name: "animalweight", type: "number" },
          { name: "injectionnumber", type: "number" },
          { name: "oftestnumber", type: "number" },
          { name: "drugrxnumber", type: "number" },
          { name: "experimenter", type: "text" },
          { name: "duration", type: "number" },
          { name: "fallsduringtest", type: "boolean" },
          { name: "notes", type: "text" },
          { name: "trackfile", type: "text" },
          { name: "pathplot", type: "text" },
          { name: "video", type: "text" },
          { name: "video_id", type: "number" }
        ]
    },
    {
        category: "fall",
        displayName: "Fall",
        fields: [
          { name: "timewhenfell", type: "number" }
        ]
    },
    {
        category: "experiment",
        displayName: "Experiment",
        fields: [
          { name: "experiment_id", type: "number" },
          { name: "experimentdesc", type: "text" }
        ]
    },
    {
        category: "study",
        displayName: "Study",
        fields: [
          { name: "study_id", type: "number" },
          { name: "studydesc", type: "text" }
        ]
    },
    {
        category: "project",
        displayName: "Project",
        fields: [
          { name: "project_id", type: "number" },
          { name: "projectdesc", type: "text" }
        ]
    },
    {
        category: "timeseries",
        displayName: "Time Series",
        fields: [
          { name: "sample_id", type: "number" },
          { name: "t", type: "time" },
          { name: "x", type: "number" },
          { name: "y", type: "number" },
          { name: "x_s", type: "number" },
          { name: "y_s", type: "number" },
          { name: "v_s", type: "number" },
          { name: "movementtype_s", type: "text" }
        ]
    }
  ]

  const lookupForText = [
    'exact', 'iexact', 'contains', 'icontains', 'startswith', 'istartswith', 'endswith', 'iendswith'
  ];
  const lookupForNumber = [
    'exact', 'gt', 'gte', 'lt', 'lte', 'range'
  ];

  const lookupTime = [

  ]
  // State to track which category's filters are visible.
  const [toggledButtons, setToggledButtons] = useState(
    Array(categories.length).fill(false)
  );

  // State to hold filter values.
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
        // Otherwise, store both lookup and value
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
      
      // Always ensure we store { lookup, value: { min, max } }
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
      // Store the chosen option as the value.
      return {
        ...prev,
        [category]: {
          ...current,
          [field]: { lookup: 'exact', value } // For discrete, lookup might be fixed or configurable separately.
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

  // When the user clicks Apply, pass the filter criteria to the parent.
  const handleApply = () => {
    //Before passing, transform filters into an array format for API call
    const filtersArray = [];
    for (const category in localFilters){
      for (const field in localFilters[category]){
        const { lookup, value } = localFilters[category][field];
        if (lookup === 'range') {
          // if min or max is empty, skip them
          const min = value.min?.trim();
          const max = value.max?.trim();
          if (!min && !max) continue; // both empty => skip
          // Example: push an object with "range" or two separate objects
          filtersArray.push({
            field: field,
            lookup: 'range',
            value: { min, max }
          });
        } else {
          // Non-range: skip if empty
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
    <div className="filters">
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
                        <label>{field.name}:</label>
                        <select
                          value={fieldData.value}
                          onChange={(e) => handleDiscreteChange(group.category, field.name, e.target.value)}
                        >
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
                        <label>{field.name}:</label>
                        <select
                          value={fieldData.lookup}
                          onChange={(e) => handleLookupChange(group.category, field.name, e.target.value)}
                        >
                          {lookupOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
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

//   return (
//     <div>
//       <div className="filterBox">
//         {/* Render filter inputs for each toggled category */}
//         <div className='parameters'>
//           {categories.map((group, index) => (
//             toggledButtons[index] && (
//               <div key={group.category} className="filter-group">
//                 <h3>{group.category}</h3>
//                 {group.fields.map(field => (
//                   <div key={field} className="filter-item">
//                     <label>{field}:</label>
//                     <input 
//                       type="text" 
//                       value={(localFilters[group.category] && localFilters[group.category][field]) || ''}
//                       onChange={(e) => handleFieldChange(group.category, field, e.target.value)}
//                     />
//                   </div>
//                 ))}
//               </div>
//             )
//           ))}
//         </div> 
//         {/* Meta-variable buttons for each category */}
//         <div className="meta-buttons">
//           {categories.map((group, index) => (
//             <button
//               key={group.category}
//               className={`metaVar ${toggledButtons[index] ? 'toggled' : ''}`}
//               onClick={() => toggleCategory(index)}
//             >
//               {group.category}
//             </button>
//           ))}
//         </div>
//       </div>
//       <button onClick={handleApply}>Apply</button>
//     </div>
//   );
// }

export default FilterButtons;
