// src/pages/components/DataWindow.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './DataWindow.css';

const DataWindow = ({ data }) => {
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

    const handleDownload = () => {
        if (!filteredData || filteredData.length === 0) {
            alert("No data available to download."); // Optional: Notify the user if no data is available
            return;
        }
        const dataStr = JSON.stringify(filteredData, null, 2); // Convert filtered data to JSON with pretty formatting
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'filtered_data_entries.json'; // Set download filename
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <input 
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
            />
            <button className="download" onClick={handleDownload}>
                Download Filtered Data
            </button>
            {filteredData.length > 0 ? (
                <ol>
                    {filteredData.map((item, index) => (
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
