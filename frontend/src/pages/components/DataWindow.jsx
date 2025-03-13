import React from 'react';
import PropTypes from 'prop-types';
import './DataWindow.css';

const DataWindow = ({ data }) => {
  console.log("DataWindow received data:", data);
  const handleDownload = () => {
    if (!data || data.length === 0) {
      alert("No data available to download.");
      return;
    }
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'filtered_data_entries.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <button className="download" onClick={handleDownload}>
        Download Filtered Data
      </button>
      {data && data.length > 0 ? (
        <ol>
          {data.map((item, index) => (
            <li key={index}>
              {Object.entries(item).map(([key, value]) => (
                <span key={key}>
                  <strong>{key}</strong>: {value?.toString()} <br />
                </span>
              ))}
            </li>
          ))}
        </ol>
      ) : (
        <p className="no-matching-entries">No matching entries found.</p>
      )}
    </div>
  );
};

DataWindow.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default DataWindow;
