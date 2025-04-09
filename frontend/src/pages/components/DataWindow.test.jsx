// DataWindow.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import DataWindow from './DataWindow';

describe('DataWindow Component', () => {
  test('renders no matching entries message when data is empty', () => {
    render(<DataWindow data={[]} />);
    expect(screen.getByText(/No matching entries found/i)).toBeInTheDocument();
  });

  test('renders a table with correct headers when data is provided', () => {
    const sampleData = [
      {
        trial_id: 1,
        dateandtime: '2025-01-01T12:00:00',
        experimenter: 'John Smith'
      }
    ];
    render(<DataWindow data={sampleData} />);
    // Use headerMapping defined in config
    const headerCells = screen.getAllByRole('columnheader');
    // DataWindow should display "Trial ID" (mapped from trial_id)
    expect(headerCells.some(cell => cell.textContent === 'Trial ID')).toBe(true);
  });

  test('renders rows correctly', () => {
    const sampleData = [
      { trial_id: 1, experimenter: 'John Doe' },
      { trial_id: 2, experimenter: 'John Smith' }
    ];
    render(<DataWindow data={sampleData} />);
    // Check if there are two rows rendered (excluding the header)
    const rows = screen.getAllByRole('row');
    // The first row is header thus expect 3 total rows
    expect(rows.length).toBe(3);
  });
});
