import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <h1>Talking Animal Model of OCD</h1>
        <p>A platform and tools to model Obsessive-Compulsive Disorder through animal behavioral data.</p>
      </header>

      {/* Project Overview Section */}
      <section className="project-overview">
        <h2>Project Overview</h2>
        <p>This project aims to create an innovative "talking" animal model of OCD by analyzing the movement patterns of animals and translating them into audio narratives. Developed at McMaster's Multiplex Imaging Facility under Dr. Henry Szechtman and Dr. Anna Dvorkin-Gheva, this project provides essential tools and data for research on the mechanisms of psychopathology.</p>
      </section>

      {/* Key Features Section */}
      <section className="key-features">
        <h2>Key Features</h2>
        <ul>
          <li><strong>Data Interface:</strong> Access and download raw animal behavior data from the FRDR repository.</li>
          <li><strong>Analysis Toolbox:</strong> Tools for calculating behavior metrics based on x,y,t coordinates, including activity levels and compulsive checking analysis.</li>
          <li><strong>Future Potential:</strong> Mapping behavior to narrative "thoughts" for innovative audio-based representations of OCD.</li>
        </ul>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <h2>Get Started</h2>
        <p>Explore our tools, access the data, and contribute to the advancement of behavioral research.</p>
        <div className="cta-buttons">
          <button onClick={() => window.location.href = '/data-interface'}>Data Interface</button>
          <button onClick={() => window.location.href = '/toolbox'}>Analysis Toolbox</button>
        </div>
      </section>

      {/* Footer with Contact Info */}
      <footer className="footer">
        <p>For more information, contact us at <a href="mailto:szechtma@mcmaster.ca">szechtma@mcmaster.ca</a> or <a href="mailto:dvorkin@mcmaster.ca">dvorkin@mcmaster.ca</a>.</p>
        <p>McMaster University, Multiplex Imaging Facility</p>
      </footer>
    </div>
  );
};

export default Home;