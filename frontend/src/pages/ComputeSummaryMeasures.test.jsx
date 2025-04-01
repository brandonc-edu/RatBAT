// import React from 'react';
// import { render, fireEvent } from '@testing-library/react';
// import ComputeSummaryMeasures from './ComputeSummaryMeasures';

// describe('ComputeSummaryMeasures', () => {
//   it('renders the component', () => {
//     const { getByText } = render(<ComputeSummaryMeasures />);
//     expect(getByText('Summary Measures')).toBeInTheDocument();
//     expect(getByText('Preprocessed Trials')).toBeInTheDocument();
//     expect(getByText('Result')).toBeInTheDocument();
//   });

//   it('shows an alert when "Apply" is clicked without selecting trials', () => {
//     const { getByText } = render(<ComputeSummaryMeasures />);
//     const applyButton = getByText('Apply');

//     // Mock the alert function
//     window.alert = jest.fn();

//     fireEvent.click(applyButton);

//     expect(window.alert).toHaveBeenCalledWith('Please select at least one trial.');
//   });

//   it('toggles a checkbox', () => {
//     const { getByLabelText } = render(<ComputeSummaryMeasures />);
//     const checkbox = getByLabelText('Homebases'); 

//     fireEvent.click(checkbox);
//     expect(checkbox.checked).toBe(true);

//     fireEvent.click(checkbox);
//     expect(checkbox.checked).toBe(false);
//   });
// });