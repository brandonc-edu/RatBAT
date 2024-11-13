// src/pages/FRDRQuery.jsx
import React from 'react';
import './FRDRQuery.css';
import DatabaseVisualizer from './components/DatabaseVisualizer';

const FRDRQuery = () => {
    const metaButtons = ['var1', 'var2', 'var3', 'var3', 'var5'];

    return (
    <div>
        {/* FILTERBOX */}
        <h2>FILTERS</h2>
        <div className = 'filterBox'>
            <div className = 'parameters'>
                Hello
            </div>
            <div className = 'metaVariables'>
                <div>Metavariables</div>
                {metaButtons.map((btn) => {
                    return <button class = 'metaVar'>{btn}</button>;
                })}
            </div>
        </div>

        <DatabaseVisualizer />



    </div>
    )
};

export default FRDRQuery;