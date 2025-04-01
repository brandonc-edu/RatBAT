import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <h1>RatBAT</h1>
        <p> Rat Behavioral Analysis Tool</p>
      </header>

      {/* Project Overview Section */}
      <section className="project-overview">
        <h2>Project Overview</h2>
        <p>
          This platform provides tools to facilitate access to and analysis of raw data from 
          experiments using the quinpirole sensitization rat model of OCD. Researchers can explore
          and download well-annotated behavioral data to support various scientific studies.
        </p>
      </section>

      {/* Theoretical Background Section */}
      <section className="theoretical-background">
        <h2>Motivation</h2>
        <p>
          The inspiration behind this platform stems from the idea of creating a “talking” animal model of OCD—where a rat's movements in an open field could be translated into a meaningful narrative, mimicking how individuals with OCD describe their compulsive behavior. 
        </p>
        <p>
          While achieving a fully realized talking animal model is a long-term goal, the first step is to structure and process existing behavioral data. This platform lays the groundwork by providing researchers with tools to access, preprocess, and analyze extensive data of rat locomotion patterns.
        </p>
      </section>

      {/* ACTUAL Theoretical Background Section */}
      <section className="theoretical-background">
        <h2>Background</h2>
        <p>
          OCD, or Obsessive Compulsive Disorder, is a severe and complex disorder that deeply impacts the lives of approximately 1% of adults worldwide. Decades of research have gone into understanding the many facets of OCD, leading to major advancements in diagnosis and treatment. 
        </p>
        <p>
          One important direction of neuroscientific research into OCD centres around creating and analysing animal models of the disorder. These models allow researchers to examine animals who possess OCD or present OCD-like symptoms and study their behaviour for important, actionable insights
        </p>
        <p>
          The Szechtman Lab Collection is comprised of over two decades worth of data collected from a multitude of experiments involving animal models of OCD, using various treatment methods on rodents to simulate OCD-like symptoms for observation. All in all, the combined research efforts total approximately twenty thousand trials worth of raw video and time series data, testing a wide array of independent variables. 
        </p>
        <p>
          Our project, RatBAT, aims to provide an accessible and powerful tool to researchers that will allow them to access, process, and analyze this data and open the door for future projects and studies that will help us better understand and treat OCD. 
        </p>
      </section>

      {/* Dataset Highlights Section */}
      <section className="dataset-highlights">
        <h2>Data Collection</h2>
        <p>
          Our dataset includes 19,976 trials of rat locomotion in an open field, containing:
        </p>
        <ul>
          <li>Video recordings of rat activity</li>
          <li>Time-series data of x, y, t coordinates</li>
          <li>Path plots of locomotion trajectories</li>
        </ul>
        <p>
          These data are publicly available in the <a href="https://www.frdr-dfdr.ca/repo/collection/szechtmanlab" target="_blank" rel="noopener noreferrer">Szechtman Lab Collection</a> on FRDR and are described in detail in the
          <a href="https://academic.oup.com/gigascience/article/doi/10.1093/gigascience/giac092/6756450" target="_blank" rel="noopener noreferrer"> GigaScience publication</a>.
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
          <div className="step">
            <span className="step-number">4</span>
            <h3>Compile Data</h3>
            <p>Compile all the data from previous steps into downloadable file(s).</p>
          </div>
        </div>
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
          <p>The platform provides access to a wide range of rat behavioral data from the <a href="https://www.frdr-dfdr.ca/repo/collection/szechtmanlab" target="_blank" rel="noopener noreferrer">Szechtman Lab Collection</a> on FRDR</p>
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
          <button onClick={() => window.location.href = '/frdr-query'}>Step 1: Go to FRDR Query</button>
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