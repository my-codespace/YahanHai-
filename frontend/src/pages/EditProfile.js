import React, { useState, useEffect } from 'react';
import Message from '../components/Message';

function EditProfile({ user, setUser }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    interest: '',
    shop416: '', // <-- WRONG! Should be shopName
    // Corrected:
    shopName: '',
    businessCategory: '',
    businessDescription: '',
    operatingHours: '',
    deliveryAvailable: false,
  });
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        interest: user.interest || '',
        shopName: user.shopName || '',
        businessCategory: user.businessCategory || '',
        businessDescription: user.businessDescription || '',
        operatingHours: user.operatingHours || '',
        deliveryAvailable: user.deliveryAvailable || false,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      const updatedUser = await response.json();
      setUser(updatedUser);
      setMessage('Profile updated successfully!');
      setMessageType('success');
      setShowMessage(true);
    } catch (err) {
      setMessage('Failed to update profile.');
      setMessageType('error');
      setShowMessage(true);
      console.error('Update failed:', err);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h1>Edit Profile</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>

        {/* Customer-Specific */}
        {user?.role === 'customer' && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Interest</label>
              <input
                type="text"
                name="interest"
                value={formData.interest}
                onChange={handleChange}
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              />
            </div>
          </>
        )}

        {/* Retailer-Specific */}
        {user?.role === 'retailer' && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label>Shop Name</label>
              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Business Category</label>
              <input
                type="text"
                name="businessCategory"
                value={formData.businessCategory}
                onChange={handleChange}
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Business Description</label>
              <textarea
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleChange}
                style={{ width: '100%', padding: 8, marginTop: 4, height: 100 }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Operating Hours</label>
              <input
                type="text"
                name="operatingHours"
                value={formData.operatingHours}
                onChange={handleChange}
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>
                <input
                  type="checkbox"
                  name="deliveryAvailable"
                  checked={formData.deliveryAvailable}
                  onChange={handleChange}
                  style={{ marginRight: 8 }}
                />
                Delivery Available
              </label>
            </div>
          </>
        )}

        <button
          type="submit"
          style={{
            background: '#1976d2',
            color: 'white',
            padding: '8px 16px',
            borderRadius: 4,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Save Changes
        </button>
      </form>
      {showMessage && (
        <Message
          message={message}
          type={messageType}
          onClose={() => setShowMessage(false)}
        />
      )}
    </div>
  );
}

// Corrected:
export default EditProfile;
