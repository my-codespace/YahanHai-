import React, { useState } from 'react';
import CustomerDashboard from './CustomerDashboard';
import RetailerDashboard from './RetailerDashboard';
import SearchBar from './SearchBar';
import FilterDropdown from './FilterDropdown';

function MapDashboardView({ user }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilter = (value) => {
    setFilterRole(value);
  };

  return (
    <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <SearchBar onSearch={handleSearch} placeholder="Search users..." />
        <FilterDropdown
          options={[
            { value: 'all', label: 'All' },
            { value: 'customer', label: 'Customers' },
            { value: 'retailer', label: 'Retailers' }
          ]}
          onFilter={handleFilter}
        />
      </div>
      {user?.role === 'customer' ? (
        <CustomerDashboard user={user} searchTerm={searchTerm} filterRole={filterRole} />
      ) : (
        <RetailerDashboard user={user} searchTerm={searchTerm} filterRole={filterRole} />
      )}
    </div>
  );
}

export default MapDashboardView;
