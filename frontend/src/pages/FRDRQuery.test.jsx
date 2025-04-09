// FRDRQuery.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FRDRQuery from './FRDRQuery';

// We'll use Jest's mocking system to override fetch calls.
global.fetch = jest.fn();

describe('FRDRQuery Component', () => {
  beforeEach(() => {
    // Clear any previous mock calls
    global.fetch.mockClear();
  });

  test('renders FRDRQuery elements', () => {
    render(<FRDRQuery />);
    
    // Check that the "Filters" header is rendered.
    expect(screen.getByText(/Filters/i)).toBeInTheDocument();
    
    // Check that the buttons for "Download Timeseries CSV" and "Load Data from FRDR" exist.
    expect(screen.getByText(/Download Timeseries CSV/i)).toBeInTheDocument();
    expect(screen.getByText(/Load Data from FRDR/i)).toBeInTheDocument();
    
    // Check that the "Select Fields" button is rendered.
    expect(screen.getByText(/Select Fields/i)).toBeInTheDocument();
  });

  test('opens and closes FieldSelector modal', async () => {
    render(<FRDRQuery />);
    fireEvent.click(screen.getByText(/Select Fields/i));
    
    // Click cancel button
    fireEvent.click(screen.getByText(/Cancel/i));
    
    // After cancel, wait for the modal to be removed. (Cancel button only occurs in fieldselector modal)
    await waitFor(() => {
      expect(screen.queryByText(/Cancel/i)).not.toBeInTheDocument();
    });
  });

  test('fetches query-data when Apply is clicked', async () => {
    // Mock fetch for the query-data endpoint.
    global.fetch.mockImplementationOnce((url, options) => {
      if (url.endsWith('/query-data/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ trial_id: 1}])
        });
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });
    
    render(<FRDRQuery />);
  
    // First, toggle the filter group on by clicking the meta button.
    fireEvent.click(screen.getByText("Trial")); 

    // Then, get the input for trial id
    const trialInput = screen.getByLabelText(/trial id/i);
    // Set a valid value so that the filters array is non-empty.
    fireEvent.change(trialInput, { target: { value: "1" } });
    
    // Simulate applying filters.
    screen.getByText(/Apply/i);
    fireEvent.click(screen.getByText(/Apply/i));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://ratbat.cas.mcmaster.ca/api/frdr-query/query-data/',
        expect.objectContaining({ method: 'POST' })
      );
    });

    // Check for an element from DataWindow (e.g., table header "Trial ID")
    expect(screen.getByText(/Trial ID/i)).toBeInTheDocument();
  });


  test('calls frdr-query API when "Load Data from FRDR" is clicked', async () => {
    // For this test, we simulate the FRDRQuery API call.
    global.fetch.mockImplementationOnce((url, options) => {
      if (url.endsWith('/frdr-query/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: "FRDR data loaded successfully!" })
        });
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });
    
    render(<FRDRQuery />);

    // First, toggle the filter group on by clicking the meta button.
    fireEvent.click(screen.getByText("Trial")); 

    // Then, get the input for trial id
    const trialInput = screen.getByLabelText(/trial id/i);
    // Set a valid value so that the filters array is non-empty.
    fireEvent.change(trialInput, { target: { value: "1" } });

    // Simulate applying filters.
    screen.getByText(/Apply/i);
    fireEvent.click(screen.getByText(/Apply/i));

    fireEvent.click(screen.getByText(/Load Data from FRDR/i));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://ratbat.cas.mcmaster.ca/api/frdr-query/frdr-query/',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  test('calls get-timeseries API when "Download Timeseries CSV" is clicked', async () => {
    // Override the default alert behavior so it doesn't block execution.
    global.alert = jest.fn();
  
    global.fetch
      // Mock query-data API call.
      .mockImplementationOnce((url, options) => {
        if (url.endsWith('/query-data/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([{ trial_id: 1 }])
          });
        }
        return Promise.reject(new Error("Unknown endpoint"));
      })
      // Mock FRDRQuery API call.
      .mockImplementationOnce((url, options) => {
        if (url.endsWith('/frdr-query/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: "FRDR data loaded successfully!" })
          });
        }
        return Promise.reject(new Error("Unknown endpoint"));
      })
      // Mock get-timeseries API call.
      .mockImplementationOnce((url, options) => {
        if (url.includes('/get-timeseries/')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                "1": { sample_id: [1, 2], t: [0.1, 0.2], x: [10, 20], y: [15, 25] }
              })
          });
        }
        return Promise.reject(new Error("Unknown endpoint"));
      });
  
    // Render the component.
    render(<FRDRQuery />);
  
    // Toggle the filter group (for example, click "Trial").
    fireEvent.click(screen.getByText("Trial")); 
  
    // Get the input for trial id and change its value.
    const trialInput = screen.getByLabelText(/trial id/i);
    fireEvent.change(trialInput, { target: { value: "1" } });
  
    // Click the "Apply" button to apply filters.
    fireEvent.click(screen.getByText(/Apply/i));
  
    // Wait until the UI shows data indicating that trial id "1" is present.
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
    
    // Now click the "Download Timeseries CSV" button.
    const downloadBtn = screen.getByText(/Download Timeseries CSV/i);
    fireEvent.click(downloadBtn);
  
    // Wait for the get-timeseries API call to occur.
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/get-timeseries/'),
        expect.objectContaining({ method: 'GET' })  // If you change fetch to include this.
        // If not, you can also use: expect.anything()
      );
    });
  });

  
});    

