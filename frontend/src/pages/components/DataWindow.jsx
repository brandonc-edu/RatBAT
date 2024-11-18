// src/pages/components/DataWindow.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './DataWindow.css';


//Search Function is included in the datawindow as it is the most simpliest way

const DataWindow = ({ data }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Function to handle changes to the search bar
    const handleSearchChange = (event) => {
      setSearchTerm(event.target.value);
    };

    // Filtered data based on search term
    const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.color.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <input 
                type = "text"
                placeholder = "Search..."
                value = {searchTerm}
                onChange = {handleSearchChange}
            />
            {filteredData.length > 0 ? (
            <ol>
                {filteredData.map((item) => (
                <li key={item.id}>
                    {item.name} - {item.category} - {item.color}
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
    data: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
    })).isRequired,
};

export default DataWindow;
