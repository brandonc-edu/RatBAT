import React, { useState } from 'react';
import './FilterButtons.css';

function FilterButtons({ onApply }) {
  const categories = [
    {
        category: "lightcyclecolony",
        fields: [
          { name: "lightcyclecolony_id", type: "number" },
          { name: "lightcyclecolonydesc", type: "text" }
        ]
    },
    {
        category: "lightcycletest",
        fields: [
          { name: "lightcycletest_id", type: "number" },
          { name: "lightcycletestdesc", type: "text" }
        ]
    },
    {
        category: "arenatype",
        fields: [
          { name: "arenatype_id", type: "number" },
          { name: "arenatypedesc", type: "text" }
        ]
    },
    {
        category: "arenaloc",
        fields: [
          { name: "arenaloc_id", type: "number" },
          { name: "arenalocdesc", type: "text" }
        ]
    },
    {
        category: "arenaobjects",
        fields: [
          { name: "arenaobjects_id", type: "number" },
          { name: "arenaobjectsdesc", type: "text" }
        ]
    },
    {
        category: "lightconditions",
        fields: [
          { name: "lightconditions_id", type: "number" },
          { name: "lightconditionsdesc", type: "text" }
        ]
    },
    {
        category: "surgerymanipulation",
        fields: [
          { name: "surgerymanipulation_id", type: "number" },
          { name: "surgerymanipulationdesc", type: "text" }
        ]
    },
    {
        category: "surgeryoutcome",
        fields: [
          { name: "surgeryoutcome_id", type: "number" },
          { name: "surgeryoutcomedesc", type: "text" }
        ]
    },
    {
        category: "eventtype",
        fields: [
          { name: "eventtype_id", type: "number" },
          { name: "eventtypedesc", type: "text" }
        ]
    },
    {
        category: "animal",
        fields: [
          { name: "animal_id", type: "number" }
        ]
    },
    {
        category: "apparatus",
        fields: [
          { name: "apparatus_id", type: "number" }
        ]
    },
    {
        category: "treatment",
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
        fields: [
          { name: "timewhenfell", type: "time" }
        ]
    },
    {
        category: "experiment",
        fields: [
          { name: "experiment_id", type: "number" },
          { name: "experimentdesc", type: "text" }
        ]
    },
    {
        category: "study",
        fields: [
          { name: "study_id", type: "number" },
          { name: "studydesc", type: "text" }
        ]
    },
    {
        category: "project",
        fields: [
          { name: "project_id", type: "number" },
          { name: "projectdesc", type: "text" }
        ]
    },
    {
        category: "timeseries",
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
    <div>
      <div className="filterBox">
        <div className="parameters">
          {categories.map((group, index) => (
            toggledButtons[index] && (
              <div key={group.category} className="filter-group">
                <h3>{group.category}</h3>
                {group.fields.map(field => {
                  const lookupOptions = field.type === "number" || field.type === "time"
                    ? lookupForNumber 
                    : lookupForText;
                  const fieldData = localFilters[group.category]?.[field.name] || { lookup: 'exact', value: '' };
                  return (
                    <div key={field.name} className="filter-item">
                      <label>{field.name}:</label>
                      {/* The dropdown for selecting lookup (exact, gt, gte, range, etc.) */}
                      <select
                        value={fieldData.lookup}
                        onChange={(e) => handleLookupChange(group.category, field.name, e.target.value)}
                      >
                        {lookupOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>

                      {/* If the user picked "range", render two inputs for min & max */}
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
                        // Otherwise, a single input for "exact", "gt", "lte", etc.
                        <input
                          type={field.type === "number" ? "number" : "text"}
                          value={typeof fieldData.value === 'string' ? fieldData.value : ''}
                          onChange={(e) => handleFieldChange(group.category, field.name, e.target.value)}
                        />
                      )}
                    </div>
                  );
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
              {group.category}
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
