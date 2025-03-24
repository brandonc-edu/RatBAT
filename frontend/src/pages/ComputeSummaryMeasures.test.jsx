import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ComputeSummaryMeasures from './ComputeSummaryMeasures';
import { ResultsContext } from '../ResultsContext';
import axios from 'axios';

jest.mock('axios');

const renderWithContext = (contextValue) => {
  return render(
    <ResultsContext.Provider value={contextValue}>
      <ComputeSummaryMeasures />
    </ResultsContext.Provider>
  );
};

describe('ComputeSummaryMeasures Component', () => {
  const dummyDataFiles = ["file1.csv", "file2.csv"];
  const dummySummaryMeasures = ["calc_homebases", "calc_HB1_meanDurationStops"];
  const dummyResults = {}; // initial results empty
  const setResults = jest.fn();

  beforeEach(() => {
    axios.get.mockImplementation((url) => {
      if (url.includes('data-files')) {
        return Promise.resolve({ data: dummyDataFiles });
      }
      if (url.includes('summary-measures')) {
        return Promise.resolve({ data: dummySummaryMeasures });
      }
      return Promise.reject(new Error('not found'));
    });
    axios.post.mockClear();
    setResults.mockClear();
  });

  test('renders ComputeSummaryMeasures component and modal text', async () => {
    renderWithContext({ results: dummyResults, setResults });
    expect(await screen.findByText(/Welcome to Compute Summary Measures/i)).toBeInTheDocument();
  });

  test('closes modal when close button is clicked', async () => {
    renderWithContext({ results: dummyResults, setResults });
    const closeButton = await screen.findByText('×');
    fireEvent.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByText(/Welcome to Compute Summary Measures/i)).not.toBeInTheDocument();
    });
  });

  test('renders summary measures and data files checkboxes after fetching', async () => {
    renderWithContext({ results: dummyResults, setResults });
    // Wait for data files to be rendered
    for (let file of dummyDataFiles) {
      expect(await screen.findByLabelText(file)).toBeInTheDocument();
    }
    // Wait for summary measures (using display names)
    expect(await screen.findByLabelText(/Homebases/)).toBeInTheDocument();
    expect(await screen.findByLabelText(/Mean Duration Stops/)).toBeInTheDocument();
  });

  test('selects and unselects all summary measures', async () => {
    renderWithContext({ results: dummyResults, setResults });
    // Wait for the summary measures checkboxes to appear
    await screen.findByLabelText(/Homebases/);
    // Scope to the summary measures section using its heading
    const summarySection = screen.getByText("Summary Measures").parentElement;
    const selectAllButton = within(summarySection).getByText(/Select All/i);
    fireEvent.click(selectAllButton);
    const homebasesCheckbox = screen.getByLabelText(/Homebases/);
    const meanDurationCheckbox = screen.getByLabelText(/Mean Duration Stops/);
    expect(homebasesCheckbox).toBeChecked();
    expect(meanDurationCheckbox).toBeChecked();
    // Now unselect all
    const unselectAllButton = within(summarySection).getByText(/Unselect All/i);
    fireEvent.click(unselectAllButton);
    expect(homebasesCheckbox).not.toBeChecked();
    expect(meanDurationCheckbox).not.toBeChecked();
  });

  test('selects and unselects all data files', async () => {
    renderWithContext({ results: dummyResults, setResults });
    // Scope to the data file section using its heading
    const dataSection = screen.getByText("Data File").parentElement;
    const selectAllButton = within(dataSection).getByText(/Select All/i);
    fireEvent.click(selectAllButton);
    const file1Checkbox = screen.getByLabelText("file1.csv");
    const file2Checkbox = screen.getByLabelText("file2.csv");
    expect(file1Checkbox).toBeChecked();
    expect(file2Checkbox).toBeChecked();
    // Now unselect all
    const unselectAllButton = within(dataSection).getByText(/Unselect All/i);
    fireEvent.click(unselectAllButton);
    expect(file1Checkbox).not.toBeChecked();
    expect(file2Checkbox).not.toBeChecked();
  });

  test('alerts when Apply is clicked without selecting a data file', async () => {
    window.alert = jest.fn();
    renderWithContext({ results: dummyResults, setResults });
    const applyButton = await screen.findByText(/Apply/i);
    fireEvent.click(applyButton);
    expect(window.alert).toHaveBeenCalledWith("Please select at least one data file.");
  });

  test('calls API and sets results on Apply when a data file is selected', async () => {
    const dummyPostResponse = { 
      data: { 
        "file1.csv": { 
          calc_homebases: ["Main", "Secondary"], 
          calc_HB1_meanDurationStops: [5.123, 6.456] 
        } 
      } 
    };
    axios.post.mockResolvedValueOnce(dummyPostResponse);
    renderWithContext({ results: dummyResults, setResults });
    
    // Wait for checkboxes
    const file1Checkbox = await screen.findByLabelText("file1.csv");
    const homebasesCheckbox = await screen.findByLabelText(/Homebases/);
    
    // Select a data file and a summary measure
    fireEvent.click(file1Checkbox);
    fireEvent.click(homebasesCheckbox);
    
    // Click the Apply button to trigger the API call
    const applyButton = screen.getByText(/Apply/i);
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/compute-summary-measures/',
        {
          data_file_paths: ["file1.csv"],
          summary_measures: ["calc_homebases"],
          environment: 'common',
        }
      );
      // Check that setResults is called with the formatted results
      expect(setResults).toHaveBeenCalled();
    });
  });

  test('updates precision dropdown value', async () => {
    renderWithContext({ results: dummyResults, setResults });
    const precisionSelect = await screen.findByLabelText(/Select Precision/i);
    expect(precisionSelect.value).toBe("2");
    fireEvent.change(precisionSelect, { target: { value: "4" } });
    expect(precisionSelect.value).toBe("4");
  });
});
