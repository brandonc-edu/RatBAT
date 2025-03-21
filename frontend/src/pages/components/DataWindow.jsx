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

  // Determine headers from the keys of the first data object
  const headers = data && data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div>
      {data && data.length > 0 ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {headers.map(header => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  {headers.map(header => (
                    <td key={header}>{item[header]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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