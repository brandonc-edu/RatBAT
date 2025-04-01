// import React from 'react';
// import { render, fireEvent, screen } from '@testing-library/react';
// import CompileDataPage from './CompileDataPage';

// describe('CompileDataPage', () => {
//   it('renders the component with all sections', () => {
//     render(<CompileDataPage />);

//     // Check if the main sections are rendered
//     expect(screen.getByText('Metadata Variables')).toBeInTheDocument();
//     expect(screen.getByText('Summary Measures')).toBeInTheDocument();
//     expect(screen.getByText('Preprocessed Trials')).toBeInTheDocument();
//     expect(screen.getByText('Preview')).toBeInTheDocument();
//   });


//   it('calls the download function when "Download Compiled Data" is clicked', () => {
//     render(<CompileDataPage />);

//     // Mock the download function
//     const downloadButton = screen.getByText('Download Compiled Data');
//     global.URL.createObjectURL = jest.fn(); // Mock URL.createObjectURL
//     fireEvent.click(downloadButton);

//     // Check if the download button triggers the download logic
//     expect(global.URL.createObjectURL).toHaveBeenCalled();
//   });
// });