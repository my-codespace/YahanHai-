import React from 'react';

function SearchBar({ onSearch, placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <input
        type="text"
        placeholder={placeholder || "Search..."}
        onChange={(e) => onSearch(e.target.value)}
        style={{
          width: '100%',
          maxWidth: 400,
          padding: '8px 12px',
          borderRadius: 6,
          border: '1px solid #ddd',
          fontSize: 16
        }}
      />
    </div>
  );
}

export default SearchBar;
