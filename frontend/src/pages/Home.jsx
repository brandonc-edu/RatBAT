import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <h1>Talking Animal Model of OCD</h1>
        <p>A Platform and Tools to Create a Talking Animal
        Model of Obsessive-Compulsive Disorder (OCD)</p>
      </header>

      {/* Project Overview Section */}
      <section className="project-overview">
        <h2>Project Overview</h2>
        <p>
          This project aims to create an innovative "talking" animal model of OCD by analyzing the movement patterns of animals and translating them into audio narratives. Developed at McMaster's Multiplex Imaging Facility under Dr. Henry Szechtman and Dr. Anna Dvorkin-Gheva, this project provides essential tools and data for research on the mechanisms of psychopathology.
        </p>
      </section>

      {/* Theoretical Background Section */}
      <section className="theoretical-background">
        <h2>Theoretical Background</h2>
        <p>
          The "talking" animal model of OCD is rooted in the observation that rat locomotion patterns in an open field are highly organized, reflecting underlying cognitive processes. 
          By mapping these patterns to human language, we aim to provide an audible narrative of the rat's behavior, mimicking how individuals with OCD describe their experiences. 
          This theoretical approach combines neuroscience, machine learning, and language translation to reveal new insights into obsessive-compulsive behavior.
        </p>
      </section>

      {/* Dataset Highlights Section */}
      <section className="dataset-highlights">
        <h2>Vast Dataset for Research</h2>
        <p>
          Our dataset encompasses 19,976 trials of rat locomotion in a standardized open field. These trials include:
        </p>
        <ul>
          <li>Video records of rat activity</li>
          <li>Time-series data (x, y, t coordinates)</li>
          <li>Path plots illustrating locomotion trajectories</li>
        </ul>
        <p>
          All data are publicly available through the Federated Research Data Repository (FRDR) and are meticulously annotated to support reuse in diverse research projects.
        </p>
      </section>

      {/* How to Use Section */}
      <section className="how-to-use">
        <h2>How to Use the Platform</h2>
        <div className="workflow-steps">
          <div className="step">
            <span className="step-number">1</span>
            <h3>FRDR Query</h3>
            <p>Select and load animal behavior data from the FRDR repository.</p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <h3>Data Preprocessing</h3>
            <p>Prepare the data files you selected for analysis.</p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <h3>Compute Summary Measures</h3>
            <p>Apply summary measures to analyze preprocessed data and calculate behavioral metrics.</p>
          </div>
        </div>
      </section>

      {/* Impact and Goals Section */}
      <section className="impact-goals">
        <h2>Impact and Goals</h2>
        <p>
          Our platform is poised to transform research on OCD and behavioral neuroscience by providing accessible tools for analyzing animal behavioral data. Key objectives include:
        </p>
        <ul>
          <li>Enhancing understanding of OCD mechanisms.</li>
          <li>Fostering cross-disciplinary collaborations in neuroscience and psychology.</li>
          <li>Developing a scalable framework for future behavioral studies.</li>
        </ul>
      </section>

      {/* FAQ Section */}
      <section className="faq">
        <h2>Frequently Asked Questions</h2>
        <div className="question">
          <h3>Who can use this platform?</h3>
          <p>This platform is designed for researchers and academics studying OCD or animal behavior patterns.</p>
        </div>
        <div className="question">
          <h3>What datasets are available?</h3>
          <p>The platform provides access to a wide range of rat behavioral data from the FRDR repository.</p>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="open-source">
        <h2>Open Source Project</h2>
        <p>
          This platform is open source, encouraging contributions from researchers, developers, and data scientists. Explore the codebase, propose improvements, or contribute directly through our <a href="https://github.com/brandonc-edu/RatBAT" target="_blank" rel="noopener noreferrer">GitHub repository</a>.
        </p>
      </section>

      {/* About the Team Section */}
      <section className="about-team">
        <h2>Meet the Team</h2>
        <p>
          Led by Dr. Henry Szechtman and Dr. Anna Dvorkin-Gheva, this project is a collaboration of researchers, developers, and students committed to advancing behavioral research.
        </p>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <h2>Get Started</h2>
        <p>Explore our tools, access the data, and contribute to the advancement of behavioral research.</p>
        <div className="cta-buttons">
          <button onClick={() => window.location.href = '/frdr-query'}>Go to FRDR Query</button>
          <button onClick={() => window.location.href = '/data-preprocessing'}>Go to Data Preprocessing</button>
          <button onClick={() => window.location.href = '/compute-summary-measures'}>Go to Summary Measures</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>For more information, contact us at <a href="mailto:szechtma@mcmaster.ca">szechtma@mcmaster.ca</a> or <a href="mailto:dvorkin@mcmaster.ca">dvorkin@mcmaster.ca</a>.</p>
      </footer>
    </div>
  );
};

export default Home;
