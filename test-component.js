// Simple test to check if DPBlockTable component is working
import React from 'react';
import { createRoot } from 'react-dom/client';
import { DPBlockTable } from './src/modules/supervisor/components/DPBlockTable';

// Mock the required props
const mockData = [];
const mockSetData = (data) => console.log('Setting data:', data);
const mockOnSave = () => console.log('Save clicked');
const mockOnSubmit = () => console.log('Submit clicked');
const yesterday = '2023-01-01';
const today = '2023-01-02';

// Create a simple test component
const TestComponent = () => {
  return (
    <div>
      <h1>Test DPBlockTable</h1>
      <DPBlockTable 
        data={mockData}
        setData={mockSetData}
        onSave={mockOnSave}
        onSubmit={mockOnSubmit}
        yesterday={yesterday}
        today={today}
        useMockData={true}
      />
    </div>
  );
};

// Render the test component
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<TestComponent />);