import React, { useState } from 'react';

interface TimeWindowSelectorProps {
  selectedWindow: number;
  onWindowChange: (window: number) => void;
}

export const TimeWindowSelector: React.FC<TimeWindowSelectorProps> = ({ 
  selectedWindow, 
  onWindowChange 
}) => {
  const [inputValue, setInputValue] = useState<string>(selectedWindow.toString());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Allow empty input for editing
    if (value === '') {
      return;
    }
    
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 30) {
      onWindowChange(numValue);
    }
  };

  const handleBlur = () => {
    const numValue = parseInt(inputValue);
    if (isNaN(numValue) || numValue < 1 || numValue > 30) {
      // Reset to current valid value if invalid
      setInputValue(selectedWindow.toString());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const numValue = parseInt(inputValue);
      if (!isNaN(numValue) && numValue >= 1 && numValue <= 30) {
        onWindowChange(numValue);
      } else {
        setInputValue(selectedWindow.toString());
      }
    }
  };

  return (
    <div className="time-selector-minimal">
      <label htmlFor="days-input" className="time-label">
        Analysis Period (Days)
      </label>
      <div className="input-wrapper-minimal">
        <input
          id="days-input"
          type="number"
          min="1"
          max="30"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          className="days-input-minimal"
          placeholder="7"
        />
        <span className="input-unit">days</span>
      </div>
    </div>
  );
};
