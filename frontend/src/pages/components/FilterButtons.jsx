import React, { useState } from 'react';
import './FilterButtons.css';

function FilterButtons({ onApply }) {
  const categories = [
    {
      category: "project",
      displayName: "Project",
      fields: [
        { name: "project_id", displayName: "project id", type: "number" },
        { name: "projectdesc", displayName: "project desc", type: "text" }
      ]
    },
    {
      category: "study",
      displayName: "Study",
      fields: [
        { name: "study_id", displayName: "study id", type: "number" },
        { name: "studydesc", displayName: "study desc", type: "text" }
      ]
    },
      {
        category: "experiment",
        displayName: "Experiment",
        fields: [
          { name: "experiment_id", displayName: "experiment id", type: "number" },
          { name: "experimentdesc", displayName: "experiment desc", type: "text" }
        ]
    },
    {
      category: "trial",
      displayName: "Trial",
      fields: [
        { name: "trial_id", displayName: "trial id", type: "number" },
        { name: "dateandtime", displayName: "date and time", type: "datetime" },
        { name: "animalweight", displayName: "animal weight", type: "number" },
        { name: "injectionnumber", displayName: "injection number", type: "number" },
        { name: "oftestnumber", displayName: "oftest number", type: "number" },
        { name: "drugrxnumber", displayName: "drugrx number", type: "number" },
        { name: "experimenter", displayName: "experimenter", type: "discrete",
          options: ["Option A", "Option B", "Option C"] },
        { name: "duration", displayName: "duration", type: "number" },
        { name: "fallsduringtest", displayName: "falls during test", type: "number" },
        { name: "notes", displayName: "notes", type: "text" },
        { name: "trackfile", displayName: "track file", type: "text" },
        { name: "pathplot", displayName: "path plot", type: "text" },
        { name: "video_id", displayName: "video id", type: "number" },
        { name: "video", displayName: "video", type: "text" },
        { name: "eventtype_id", displayName: "event type id", type: "number" },
        { name: "eventtypedesc", displayName: "event type desc",type: "discrete",
          options: ["Option A", "Option B", "Option C"] }
      ]
    },
    {
        category: "animal",
        displayName: "Animal",
        fields: [
          { name: "animal_id",displayName: "animal id", type: "number" },
          { name: "lightcyclecolony_id", displayName: "light cycle colony id", type: "number" },
          { name: "lightcyclecolonydesc", displayName: "light cycle colony desc", type: "discrete",
            options: ["Option A", "Option B", "Option C"] },
          { name: "lightcycletest_id", displayName: "light cycle test id", type: "number" },
          { name: "lightcycletestdesc", displayName: "light cycle test desc", type: "discrete",
            options: ["Option A", "Option B", "Option C"] } 
        ]
    },
    {
        category: "apparatus",
        displayName: "Apparatus",
        fields: [
          { name: "apparatus_id", displayName: "apparatus id", type: "number" },
          { name: "arenatype_id", displayName: "arena type id", type: "number" },
          { name: "arenatypedesc", displayName: "arena type desc", type: "discrete",
            options: ["Option A", "Option B", "Option C"] },
          { name: "arenaloc_id", displayName: "arena location id", type: "number" },
          { name: "arenalocdesc", displayName: "arena location desc", type: "discrete",
            options: ["Option A", "Option B", "Option C"] },
          { name: "arenaobjects_id", displayName: "arena objects id", type: "number" },
          { name: "arenaobjectsdesc", displaytName: "arena object desc", type: "discrete",
            options: ["Option A", "Option B", "Option C"] },
          { name: "lightconditions_id", displayName: "light conditions id", type: "number" },
          { name: "lightconditionsdesc", displayName: "light condition desc", type: "discrete",
            options: ["Option A", "Option B", "Option C"] }

        ]
    },
    {
        category: "treatment",
        displayName: "Treatment",
        fields: [
          { name: "treatment_id", displayName: "treatment id", type: "number" },
          { name: "surgerymanipulation_id", displayName: "surgery manipulation id", type: "number" },
          { name: "surgerymanipulationdesc", displayName: "surgerymanipulation desc",type: "discrete",
            options: ["Option A", "Option B", "Option C"] },
          { name: "surgeryoutcome_id", displayName: "surgery outcome id", type: "number" },
          { name: "surgeryoutcomedesc", displayName: "surgery outcome desc", type: "discrete",
            options: ["Option A", "Option B", "Option C"] },
          { name: "drugrx_drug1", displayName: "drugrx drug 1", type: "text" },
          { name: "drugrx_dose1", displayName: "drugrx dose 1", type: "number" },
          { name: "drugrx_drug2", displayName: "drugrx drug 2", type: "text" },
          { name: "drugrx_dose2", displayName: "drugrx dose 2", type: "number" },
          { name: "drugrx_drug3", displayName: "drugrx drug 3", type: "text" },
          { name: "drugrx_dose3", displayName: "drugrx dose 3", type: "number" }
        ]
    }

    // {
    //     category: "fall",
    //     displayName: "Fall",
    //     fields: [
    //       { name: "timewhenfell", displayName: "time when fell", type: "number" }
    //     ]
    // },

    // {
    //     category: "timeseries",
    //     displayName: "Time Series",
    //     fields: [
    //       { name: "sample_id", displayName: "sample id", type: "number" },
    //       { name: "t", displayName: "t", type: "time" },
    //       { name: "x", displayName: "x", type: "number" },
    //       { name: "y", displayName: "y", type: "number" },
    //       { name: "x_s", displayName: "x_s", type: "number" },
    //       { name: "y_s", displayName: "y_s", type: "number" },
    //       { name: "v_s", displayName: "v_s", type: "number" },
    //       { name: "movementtype_s", displayName: "movement type_s", type: "text" }
    //     ]
    // }
  ]

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
    <div className="filter-buttons">
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