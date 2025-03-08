// src/Header.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [activeTab, setActiveTab] = useState('home');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="header">
      <ul className="tab-list">
        <li className={`tab ${activeTab === 'home' ? 'active' : ''}`}>
          <Link to="/" onClick={() => handleTabClick('home')}>Home</Link>
        </li>
        <li className={`tab ${activeTab === 'frdr-query' ? 'active' : ''}`}>
          <Link to="/frdr-query" onClick={() => handleTabClick('frdr-query')}>FRDR Query</Link>
        </li>
        <li className={`tab ${activeTab === 'data-preprocessing' ? 'active' : ''}`}>
          <Link to="/data-preprocessing" onClick={() => handleTabClick('data-preprocessing')}>Data Preprocessing</Link>
        </li>
        <li className={`tab ${activeTab === 'compute-summary-measures' ? 'active' : ''}`}>
          <Link to="/compute-summary-measures" onClick={() => handleTabClick('compute-summary-measures')}>Compute Summary Measures</Link>
        </li>
        <li className={`tab ${activeTab === 'compile-data' ? 'active' : ''}`}>
          <Link to="/compile-data" onClick={() => handleTabClick('compile-data')}>Compile Data</Link>
        </li>
      </ul>
    </div>
  );
};

export default Header;