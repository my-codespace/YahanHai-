import React from 'react';

function FilterDropdown({ options, onFilter }) {
  return (
    <div className="custom-select">
      <select
        onChange={(e) => onFilter(e.target.value)}
        style={{ minWidth: 120 }} // fallback for browsers without custom CSS
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export default FilterDropdown;
