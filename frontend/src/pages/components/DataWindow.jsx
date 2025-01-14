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
        const dataStr = JSON.stringify(data, null, 2); // Convert data to string with pretty-printing
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'data.json';
        link.click();
        URL.revokeObjectURL(url);
      };

    return (
        <div className="data-window">
            <input 
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
            />
            <button className='download'
                onClick={handleDownload}
            >
                download</button>
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
                <p>No matching entries found.</p>
            )}
        </div>
    );
};

DataWindow.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default DataWindow;