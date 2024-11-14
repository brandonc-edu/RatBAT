// src/pages/components/DataWindow.jsx
import React from 'react';
import PropTypes from 'prop-types';
// import './DataWindow.css';

const DataWindow = ({ data }) => (
    <div>
        {data.length > 0 ? (
        <ul>
            {data.map((item) => (
            <li key={item.id}>
                {item.name} - {item.category} - {item.color}
            </li>
            ))}
        </ul>
        ) : (
        <p>No matching entries found.</p>
        )}
    </div>
);

DataWindow.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
    })).isRequired,
};

export default DataWindow;
