// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Header';
import Home from './pages/Home';
import FRDRQuery from './pages/FRDRQuery';
import DataPreprocessing from './pages/DataPreprocessing';
import ComputeSummaryMeasures from './pages/ComputeSummaryMeasures';
import CompileDataPage from './pages/CompileDataPage';
import { ResultsProvider } from './ResultsContext';

const App = () => (
  <Router>
    <Header />
    <ResultsProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/frdr-query" element={<FRDRQuery />} />
        <Route path="/data-preprocessing" element={<DataPreprocessing />} />
        <Route path="/compute-summary-measures" element={<ComputeSummaryMeasures />} />
        <Route path="/compile-data" element={<CompileDataPage />} />
      </Routes>
    </ResultsProvider>
  </Router>
);

export default App;