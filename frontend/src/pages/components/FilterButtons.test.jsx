// FilterButtons.test.jsx
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import FilterButtons from './FilterButtons';

// Create a simple mock categories array with one category and a few fields.
const mockCategories = [
  {
    category: "testCategory",
    displayName: "Test Category",
    fields: [
      { name: "field1", displayName: "Field One", type: "text" },
      { name: "field2", displayName: "Field Two", type: "number" },
      { name: "field3", displayName: "Field Three", type: "discrete", options: ["Option A", "Option B", "Option C"] }
    ]
  }
];

describe('FilterButtons Component', () => {
  let onApplyMock;

  beforeEach(() => {
    onApplyMock = jest.fn();
  });

  test('renders meta buttons from categories', () => {
    render(<FilterButtons categories={mockCategories} onApply={onApplyMock} />);

    // Check that the meta button for Test Category is rendered.
    expect(screen.getByText("Test Category")).toBeInTheDocument();
  });

  test('toggles the visibility of a filter group when meta button is clicked', () => {
    render(<FilterButtons categories={mockCategories} onApply={onApplyMock} />);

    // Initially, the filter group for "Test Category" should not be visible.
    expect(screen.queryByText(/Field One:/i)).toBeNull();

    // Click the meta button to toggle the filter group.
    const metaButton = screen.getByText("Test Category");
    fireEvent.click(metaButton);

    // Now, the filter group should appear.
    expect(screen.getByText(/Field One:/i)).toBeInTheDocument();
    expect(screen.getByText(/Field Two:/i)).toBeInTheDocument();
    expect(screen.getByText(/Field Three:/i)).toBeInTheDocument();
  });

  test('updates filters correctly and calls onApply when Apply is clicked', () => {
    render(<FilterButtons categories={mockCategories} onApply={onApplyMock} />);

    // Toggle the filter group to make inputs visible.
    fireEvent.click(screen.getByText("Test Category"));

    // Now, update the inputs for each field.

    // For "Field One" (text type)
    const fieldOneLabel = screen.getByText(/Field One:/i);
    const fieldOneContainer = fieldOneLabel.parentElement;
    const fieldOneInput = within(fieldOneContainer).getByRole('textbox');
    fireEvent.change(fieldOneInput, { target: { value: "hello" } });

    // For "Field Two" (number type)
    const fieldTwoLabel = screen.getByText(/Field Two:/i);
    const fieldTwoContainer = fieldTwoLabel.parentElement;
    const fieldTwoSelect = within(fieldTwoContainer).getByRole('combobox');
    fireEvent.change(fieldTwoSelect, { target: { value: "gt" } });
    const fieldTwoInput = within(fieldTwoContainer).getByRole('spinbutton');
    fireEvent.change(fieldTwoInput, { target: { value: "100" } });

    // For "Field Three" (discrete type), rendered as a select.
    const fieldThreeLabel = screen.getByText(/Field Three:/i);
    const fieldThreeContainer = fieldThreeLabel.parentElement;
    const fieldThreeSelect = within(fieldThreeContainer).getByRole('combobox');
    fireEvent.change(fieldThreeSelect, { target: { value: "Option B" } });

    // Click the global Apply button.
    const applyButton = screen.getByText("Apply");
    fireEvent.click(applyButton);

    // Expect onApplyMock to be called with the correctly structured filters.
    expect(onApplyMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        { field: "field1", lookup: "exact", value: "hello" },
        { field: "field2", lookup: "gt", value: "100" },
        { field: "field3", lookup: "exact", value: "Option B" }
      ])
    );
  });
});
