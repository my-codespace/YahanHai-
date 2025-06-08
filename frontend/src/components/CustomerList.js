import React from 'react';

export default function CustomerList({ customers }) {
  return (
    <div className="customer-list">
      <h3>Interested Customers ({customers.length})</h3>
      {customers.map(customer => (
        <div key={customer._id} className="customer-card" style={{ display: "flex", alignItems: "center", marginBottom: 16, background: "#fff", borderRadius: 8, padding: 12 }}>
          <img
            src={customer.profilePic || "/default-avatar.png"}
            alt={customer.name}
            style={{ width: 50, height: 50, borderRadius: "50%", marginRight: 16, objectFit: "cover" }}
          />
          <div>
            <h4 style={{ margin: 0 }}>{customer.name}</h4>
            <p style={{ margin: "4px 0", color: "#666" }}>{customer.city}</p>
            <p style={{ margin: "4px 0", color: "#666" }}>Interests: {customer.interest}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
