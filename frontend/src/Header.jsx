// src/Header.js
import React, { useState } from 'react';
import './Header.css'; // Import the CSS for the header

const Header = () => {
  const [activeTab, setActiveTab] = useState('home');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="header">
      <ul className="tab-list">
        <li className={`tab ${activeTab === 'home' ? 'active' : ''}`}>
          <a href="#home" onClick={() => handleTabClick('home')}>Home</a>
        </li>
        <li className={`tab ${activeTab === 'frdr-query' ? 'active' : ''}`}>
          <a href="#frdr-query" onClick={() => handleTabClick('frdr-query')}>FRDR Query</a>
        </li>
        <li className={`tab ${activeTab === 'data-preprocessing' ? 'active' : ''}`}>
          <a href="#data-preprocessing" onClick={() => handleTabClick('data-preprocessing')}>Data Preprocessing</a>
        </li>
        <li className={`tab ${activeTab === 'compute-summary-measures' ? 'active' : ''}`}>
          <a href="#compute-summary-measures" onClick={() => handleTabClick('compute-summary-measures')}>Compute Summary Measures</a>
        </li>
      </ul>
    </div>
  );
};

export default Header;
