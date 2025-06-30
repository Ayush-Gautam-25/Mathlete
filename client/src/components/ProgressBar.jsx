// ProgressBar.jsx
import React from 'react';

const ProgressBar = ({ value, max, loader }) => {
  let percentage = (value / max) * 100;
  if (value < 0) {
    percentage = 0
  }

  return (
    <div style={{
      width: '70%',
      height: '12px',
      backgroundColor: loader ? 'grey' : '#f1f5f9',
      borderRadius: '6px',
      overflow: 'hidden',

    }}>
      <div
        style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: 'black', // Tailwind 'blue-400'
        }}
      />
    </div>
  );
};

export default ProgressBar;
