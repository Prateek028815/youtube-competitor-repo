import React from 'react';

interface ChartContainerProps {
  title: string;
  children?: React.ReactNode; // Made optional
  onExport?: () => void;
  className?: string;
  isLoading?: boolean;
  error?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  children,
  onExport,
  className = '',
  isLoading = false,
  error
}) => {
  console.log('📊 Rendering ChartContainer:', title);

  if (error) {
    return (
      <div className={`chart-container error ${className}`}>
        <div className="chart-header">
          <h3 className="chart-title">{title}</h3>
        </div>
        <div className="chart-error">
          <h4>❌ Chart Error</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`chart-container loading ${className}`}>
        <div className="chart-header">
          <h3 className="chart-title">{title}</h3>
        </div>
        <div className="chart-loading">
          <span>🔄 Loading chart data...</span>
        </div>
      </div>
    );
  }

  // Only render children section if children exist
  return (
    <div className={`chart-container ${className}`}>
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        {onExport && (
          <button onClick={onExport} className="export-btn">
            📊 Export Chart
          </button>
        )}
      </div>
      {children && (
        <div className="chart-content">
          {children}
        </div>
      )}
    </div>
  );
};
