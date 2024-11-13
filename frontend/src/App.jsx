// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Header';
import Home from './pages/Home';
import FRDRQuery from './pages/FRDRQuery';
import DataPreprocessing from './pages/DataPreprocessing';
import ComputeSummaryMeasures from './pages/ComputeSummaryMeasures';
import './App.css';

const App = () => (
  <Router>
    <Header />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/frdr-query" element={<FRDRQuery />} />
      <Route path="/data-preprocessing" element={<DataPreprocessing />} />
      <Route path="/compute-summary-measures" element={<ComputeSummaryMeasures />} />
    </Routes>
  </Router>
);

export default App;
