import React, { useState } from 'react';
import './FilterButtons.css';

function FilterButtons({ onApply }) {
  const categories = [
    {
        "category": "lightcyclecolony",
        "fields": [
            "lightcyclecolony_id",
            "lightcyclecolonydesc"
        ]
    },
    {
        "category": "lightcycletest",
        "fields": [
            "lightcycletest_id",
            "lightcycletestdesc"
        ]
    },
    {
        "category": "arenatype",
        "fields": [
            "arenatype_id",
            "arenatypedesc"
        ]
    },
    {
        "category": "arenaloc",
        "fields": [
            "arenaloc_id",
            "arenalocdesc"
        ]
    },
    {
        "category": "arenaobjects",
        "fields": [
            "arenaobjects_id",
            "arenaobjectsdesc"
        ]
    },
    {
        "category": "lightconditions",
        "fields": [
            "lightconditions_id",
            "lightconditionsdesc"
        ]
    },
    {
        "category": "surgerymanipulation",
        "fields": [
            "surgerymanipulation_id",
            "surgerymanipulationdesc"
        ]
    },
    {
        "category": "surgeryoutcome",
        "fields": [
            "surgeryoutcome_id",
            "surgeryoutcomedesc"
        ]
    },
    {
        "category": "eventtype",
        "fields": [
            "eventtype_id",
            "eventtypedesc"
        ]
    },
    {
        "category": "animal",
        "fields": [
            "animal_id"
        ]
    },
    {
        "category": "apparatus",
        "fields": [
            "apparatus_id"
        ]
    },
    {
        "category": "treatment",
        "fields": [
            "treatment_id",
            "drugrx_drug1",
            "drugrx_dose1",
            "drugrx_drug2",
            "drugrx_dose2",
            "drugrx_drug3",
            "drugrx_dose3"
        ]
    },
    {
        "category": "trial",
        "fields": [
            "trial_id",
            "dateandtime",
            "animalweight",
            "injectionnumber",
            "oftestnumber",
            "drugrxnumber",
            "experimenter",
            "duration",
            "fallsduringtest",
            "notes",
            "trackfile",
            "pathplot",
            "video",
            "video_id"
        ]
    },
    {
        "category": "fall",
        "fields": [
            "timewhenfell"
        ]
    },
    {
        "category": "experiment",
        "fields": [
            "experiment_id",
            "experimentdesc"
        ]
    },
    {
        "category": "study",
        "fields": [
            "study_id",
            "studydesc"
        ]
    },
    {
        "category": "project",
        "fields": [
            "project_id",
            "projectdesc"
        ]
    },
    {
        "category": "timeseries",
        "fields": [
            "sample_id",
            "t",
            "x",
            "y",
            "x_s",
            "y_s",
            "v_s",
            "movementtype_s"
        ]
    }
  ]

  
  // New discrete filters configuration (not used here but kept for reference)
  const discreteFilters = {
    "Light/Dark Cycle": ['lights ON', 'lights OFF'],
    "Arena Type": ['160x160 cm table surface on 60 cm high legs', 'Plexiglas box 40x40x35 cm'],
    "Arena ID": ['OF #1 in room U59_south', 'OF #2 in room U59_north'],
    "Drug Treatment": ['QNP', 'SAL'],
    "Dose": ['0', '0.5'],
    "Date": [],
    "Project Label": [],
    "Study Title": [],
    "Room Light Condition": ['room ILLUMINATED (fluorescent lights ON)'],
    "Trial Type": ['Standard OF trial'],
    "What Objects": ['Trackfile+Pathplot+Video'],
    "Experimenter": []
  };

  // New continuous filter configuration (not used in this example)
  const continuousFilters = {
    "Date": { type: "date" },
    "Trial Duration": { type: "number", placeholder: "minutes" },
    "Body Weight": { type: "number", placeholder: "kg" },
    "Track Duration": { type: "number", placeholder: "seconds" }
  };

  // State to track which category's filters are visible.
  const [toggledButtons, setToggledButtons] = useState(
    Array(categories.length).fill(false)
  );

  // State to hold filter values.
  // Structure: { [category]: { [field]: value, ... }, ... }
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
  const handleFieldChange = (category, field, value) => {
    setLocalFilters (prev => {
      //Copy previous filters for category or empty
      const categoryFilters = {...(prev[category] || {})};

      //If new value is empty then remove the field entirely
      if (value.trim() == ""){
        delete categoryFilters[field];
      }else{
        categoryFilters[field] = value;
      }
      return{
        ...prev,
        [category]: categoryFilters
      };
    });
  };

  // When the user clicks Apply, pass the filter criteria to the parent.
  const handleApply = () => {
    onApply(localFilters);
  };

  return (
    <div>
      <div className="filterBox">
        {/* Render filter inputs for each toggled category */}
        <div className='parameters'>
          {categories.map((group, index) => (
            toggledButtons[index] && (
              <div key={group.category} className="filter-group">
                <h3>{group.category}</h3>
                {group.fields.map(field => (
                  <div key={field} className="filter-item">
                    <label>{field}:</label>
                    <input 
                      type="text" 
                      value={(localFilters[group.category] && localFilters[group.category][field]) || ''}
                      onChange={(e) => handleFieldChange(group.category, field, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )
          ))}
        </div> 
        {/* Meta-variable buttons for each category */}
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

export default FilterButtons;
