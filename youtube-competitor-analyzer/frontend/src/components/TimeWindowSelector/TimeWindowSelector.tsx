import React from 'react';

interface TimeWindowSelectorProps {
  selectedWindow: 7 | 15 | 30;
  onWindowChange: (window: 7 | 15 | 30) => void;
}

export const TimeWindowSelector: React.FC<TimeWindowSelectorProps> = ({
  selectedWindow,
  onWindowChange
}) => {
  const timeOptions: Array<{ value: 7 | 15 | 30; label: string }> = [
    { value: 7, label: 'Last 7 days' },
    { value: 15, label: 'Last 15 days' },
    { value: 30, label: 'Last 30 days' }
  ];

  return (
    <div className="time-window-selector">
      <h3>Analysis Period</h3>
      <div className="radio-group">
        {timeOptions.map((option) => (
          <label key={option.value} className="radio-item">
            <input
              type="radio"
              name="timeWindow"
              value={option.value}
              checked={selectedWindow === option.value}
              onChange={() => onWindowChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
};
