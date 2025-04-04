import React from 'react';
import PropTypes from 'prop-types';
import './DataWindow.css';

const DataWindow = ({ data }) => {
  console.log("DataWindow received data:", data);
  const headers = data && data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="data-window">
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