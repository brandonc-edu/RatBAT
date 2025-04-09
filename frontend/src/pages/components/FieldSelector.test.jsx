// FieldSelector.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FieldSelector from './FieldSelector';

// Define a mock availableFields array for testing.
const availableFields = [
  { name: 'trial_id', displayName: 'Trial ID', type: 'number' },
  { name: 'fieldA', displayName: 'Field A', type: 'text' },
  { name: 'fieldB', displayName: 'Field B', type: 'number' },
  { name: 'fieldC', displayName: 'Field C', type: 'discrete', options: ['Option 1', 'Option 2'] }
];

describe('FieldSelector Component', () => {
  let onChangeMock;
  let onCloseMock;

  beforeEach(() => {
    onChangeMock = jest.fn();
    onCloseMock = jest.fn();
  });

  test('renders all field buttons and disables trial_id button', () => {
    render(
      <FieldSelector
        availableFields={availableFields}
        onChange={onChangeMock}
        onClose={onCloseMock}
        initialSelected={[]}  // Start with an empty selection (trial_id will be forced on)
      />
    );

    // trial_id is always selected and should be disabled.
    const trialButton = screen.getByText("Trial ID");
    expect(trialButton).toBeInTheDocument();
    expect(trialButton).toBeDisabled();

    // Other field buttons should be rendered.
    expect(screen.getByText("Field A")).toBeInTheDocument();
    expect(screen.getByText("Field B")).toBeInTheDocument();
    expect(screen.getByText("Field C")).toBeInTheDocument();
  });

  test('toggles field selection correctly', () => {
    render(
      <FieldSelector
        availableFields={availableFields}
        onChange={onChangeMock}
        onClose={onCloseMock}
        initialSelected={[]}  // Start with empty selected (apart from trial_id)
      />
    );

    // Field A should initially not be toggled.
    const fieldAButton = screen.getByText("Field A");
    expect(fieldAButton).not.toHaveClass("toggled");

    // Toggle Field A
    fireEvent.click(fieldAButton);
    expect(fieldAButton).toHaveClass("toggled");

    // Toggle Field A again, it should switch off.
    fireEvent.click(fieldAButton);
    expect(fieldAButton).not.toHaveClass("toggled");
  });

  test('calls onChange with selected fields and calls onClose when Apply is clicked', () => {
    render(
      <FieldSelector
        availableFields={availableFields}
        onChange={onChangeMock}
        onClose={onCloseMock}
        initialSelected={['trial_id']}
      />
    );

    // Toggle Field B and Field C.
    const fieldBButton = screen.getByText("Field B");
    const fieldCButton = screen.getByText("Field C");
    fireEvent.click(fieldBButton);
    fireEvent.click(fieldCButton);

    // Click the "Apply" button.
    const applyButton = screen.getByText("Save");
    fireEvent.click(applyButton);

    // onChangeMock should be called with an array containing 'trial_id', 'fieldB', and 'fieldC'.
    expect(onChangeMock).toHaveBeenCalledWith(
      expect.arrayContaining(['trial_id', 'fieldB', 'fieldC'])
    );
    // Also, onClose should be called to close the modal.
    expect(onCloseMock).toHaveBeenCalled();
  });

  test('calls onClose when Cancel is clicked', () => {
    render(
      <FieldSelector
        availableFields={availableFields}
        onChange={onChangeMock}
        onClose={onCloseMock}
        initialSelected={['trial_id']}
      />
    );

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(onCloseMock).toHaveBeenCalled();
  });
});
