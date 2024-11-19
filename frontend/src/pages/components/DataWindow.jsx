import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './DataWindow.css';

const DataWindow = ({ data }) => {
    console.log('DataWindow received data:', data); // Debugging log

    // If data is not an array, handle gracefully
    if (!Array.isArray(data) || data.length === 0) {
        return <p>No data available</p>;
    }

    const [searchTerm, setSearchTerm] = useState('');

    // Function to handle changes to the search bar
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // Filtered data based on search term.
    const filteredData = Array.isArray(data) ? data.filter(item =>
        Object.values(item).some(value =>
            value !== null &&
            !Number.isNaN(value) &&
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    ) : [];

    // Extract unique keys for table headers
    const headers = filteredData.length > 0 ? Object.keys(filteredData[0]) : [];

    return (
        <div>
            <input 
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
            />
            <div className="scrollable-container">
                {filteredData.length > 0 ? (
                    <div className="data-grid">
                        {/* Render headers */}
                        <div className="header-row">
                            {headers.map((header, index) => (
                                <div key={index} className="data-cell header-cell">
                                    {header}
                                </div>
                            ))}
                        </div>
                        {/* Render data rows */}
                        {filteredData.map((item, index) => (
                            <div key={index} className="data-row">
                                {headers.map((key, i) => (
                                    <div key={i} className="data-cell">
                                        {item[key]?.toString()}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No matching entries found.</p>
                )}
            </div>
        </div>
    );
};

DataWindow.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
};
export default DataWindow;
