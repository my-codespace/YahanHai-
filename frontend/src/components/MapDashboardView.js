import React, { useState } from 'react';
import CustomerDashboard from './CustomerDashboard';
import RetailerDashboard from './RetailerDashboard';
import SearchBar from './SearchBar';
import FilterDropdown from './FilterDropdown';
import Card from './Card';

function MapDashboardView({ user }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const handleSearch = (term) => setSearchTerm(term);
  const handleFilter = (value) => setFilterRole(value);

  // You must pass the correct props to MapPanel (location, markers, role, user)
  // Example below assumes you have location and markers available in parent or via props/context

  return (
    <div>
      
      <Card>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
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
      </Card>
    </div>
  );
}

export default MapDashboardView;
