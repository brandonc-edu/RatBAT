import React, { useState, useEffect } from 'react';
import './FieldSelector.css';

const FieldSelector = ({ availableFields, onChange, onClose, initialSelected}) => {
  // Initialize selection state: trial_id is always selected.
  const [selected, setSelected] = useState(() => {
    const initial = {};
    availableFields.forEach(field => {
      initial[field.name] = initialSelected.includes(field.name)|| field.name === 'trial_id';
    });
    return initial;
  });

  useEffect(() => {
    const newSelected = {};
    availableFields.forEach(field => {
      newSelected[field.name] = initialSelected.includes(field.name) || field.name === 'trial_id';
    });
    setSelected(newSelected);
  }, [initialSelected, availableFields]);

  // Whenever selection changes, notify parent with the list of selected field names.
  const handleApply = () => {
    const selectedFields = availableFields
      .filter(field => selected[field.name])
      .map(field => field.name);
    // Ensure trial_id is always included.
    if (!selectedFields.includes('trial_id')) {
      selectedFields.push('trial_id');
    }
    onChange(selectedFields);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  }

  const toggleField = (fieldName) => {
    // Do not allow toggling trial_id.
    if (fieldName === 'trial_id') return;
    setSelected(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  return (
    <div className="field-selector">
        <div className="modal-content">
            <h2>Select Fields</h2>
            <div className="field-box">
                {availableFields.map(field => (
                    <button 
                    key={field.name}
                    className={`field-button ${selected[field.name] ? 'toggled' : ''}`}
                    onClick={() => toggleField(field.name)}
                    disabled={field.name === 'trial_id'}
                    >
                    {field.displayName || field.name}
                    </button>
                ))}
            </div>
            <div className="modal-actions">
            <button className="apply" onClick={handleApply}>Save</button>
            <button className="cancel" onClick={handleCancel}>Cancel</button>
            </div>
        </div>
        </div>
    );
    };
export default FieldSelector;