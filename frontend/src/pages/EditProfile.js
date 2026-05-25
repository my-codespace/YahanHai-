import React, { useState, useEffect, useRef } from 'react';
import Message from '../components/Message';
import { FiUser, FiCamera, FiSave, FiUpload, FiSettings } from 'react-icons/fi';
import { resolveAssetUrl } from '../utils/resolveAssetUrl';

function EditProfile({ user, setUser }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    // Customer fields
    proximityAlerts: true,
    // Retailer fields
    shopName: '',
    businessCategory: '',
    businessDescription: '',
    gstin: '',
    deliveryAvailable: false,
    openTime: '',
    closeTime: '',
    closedOn: '',
  });

  // File states
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState('');

  const [businessLogo, setBusinessLogo] = useState(null);
  const [businessLogoPreview, setBusinessLogoPreview] = useState('');

  const [ownerPhoto, setOwnerPhoto] = useState(null);
  const [ownerPhotoPreview, setOwnerPhotoPreview] = useState('');

  const [storefrontPhoto, setStorefrontPhoto] = useState(null);
  const [storefrontPhotoPreview, setStorefrontPhotoPreview] = useState('');

  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  // Input refs
  const profilePicRef = useRef();
  const businessLogoRef = useRef();
  const ownerPhotoRef = useRef();
  const storefrontPhotoRef = useRef();

  // Helper to build resolved URL
  const getFullUrl = (path) => {
    return resolveAssetUrl(path);
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        proximityAlerts: user.notificationPreferences?.proximityAlerts ?? true,
        shopName: user.shopName || '',
        businessCategory: user.businessCategory || '',
        businessDescription: user.businessDescription || '',
        gstin: user.gstin || '',
        deliveryAvailable: user.deliveryAvailable || false,
        openTime: user.operatingHours?.open || '',
        closeTime: user.operatingHours?.close || '',
        closedOn: user.operatingHours?.closedOn || '',
      });

      if (user.role === 'customer' && user.profilePic) {
        setProfilePicPreview(getFullUrl(user.profilePic));
      } else if (user.role === 'retailer') {
        if (user.businessLogo) setBusinessLogoPreview(getFullUrl(user.businessLogo));
        if (user.ownerPhoto) setOwnerPhotoPreview(getFullUrl(user.ownerPhoto));
        if (user.storefrontPhoto) setStorefrontPhotoPreview(getFullUrl(user.storefrontPhoto));
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    if (type === 'profilePic') {
      setProfilePic(file);
      setProfilePicPreview(previewUrl);
    } else if (type === 'businessLogo') {
      setBusinessLogo(file);
      setBusinessLogoPreview(previewUrl);
    } else if (type === 'ownerPhoto') {
      setOwnerPhoto(file);
      setOwnerPhotoPreview(previewUrl);
    } else if (type === 'storefrontPhoto') {
      setStorefrontPhoto(file);
      setStorefrontPhotoPreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);

      if (user.role === 'customer') {
        data.append('notificationPreferences', JSON.stringify({
          proximityAlerts: formData.proximityAlerts
        }));
        if (profilePic) {
          data.append('profilePic', profilePic);
        }
      } else {
        data.append('shopName', formData.shopName);
        data.append('businessCategory', formData.businessCategory);
        data.append('businessDescription', formData.businessDescription);
        data.append('gstin', formData.gstin);
        data.append('deliveryAvailable', formData.deliveryAvailable);
        data.append('operatingHours', JSON.stringify({
          open: formData.openTime,
          close: formData.closeTime,
          closedOn: formData.closedOn
        }));

        if (businessLogo) data.append('businessLogo', businessLogo);
        if (ownerPhoto) data.append('retailerPhoto', ownerPhoto); // Field name expected by backend: retailerPhoto
        if (storefrontPhoto) data.append('storefrontPhoto', storefrontPhoto);
      }

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setMessage('Profile updated successfully!');
      setMessageType('success');
      setShowMessage(true);
    } catch (err) {
      setMessage(err.message || 'Failed to update profile.');
      setMessageType('error');
      setShowMessage(true);
      console.error('Update failed:', err);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 20px' }}>
      <h1 style={{ fontWeight: 800, fontSize: '2.2rem', letterSpacing: '-1px', marginBottom: '24px', color: 'var(--text)' }}>
        Edit Profile
      </h1>

      <form onSubmit={handleSubmit} className="edit-profile-layout">
        
        {/* Left Column: Avatar/Logo Uploader */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {user?.role === 'customer' ? (
            <div className="edit-profile-avatar-section">
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Profile Photo</h3>
              <div className="avatar-upload-container" onClick={() => profilePicRef.current.click()}>
                <img 
                  src={profilePicPreview || '/default-avatar.png'} 
                  alt="Avatar" 
                  className="avatar-upload-preview" 
                />
                <div className="avatar-upload-overlay">
                  <FiCamera size={18} />
                </div>
              </div>
              <input 
                type="file" 
                ref={profilePicRef} 
                onChange={(e) => handleFileChange(e, 'profilePic')} 
                className="image-file-input" 
                accept="image/*"
              />
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Click avatar to upload new photo
              </p>
            </div>
          ) : (
            <div className="edit-profile-avatar-section" style={{ alignItems: 'stretch' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 700, textAlign: 'center' }}>Shop Visuals</h3>
              
              {/* Business Logo */}
              <div className="retailer-photo-upload-card" onClick={() => businessLogoRef.current.click()}>
                <input 
                  type="file" 
                  ref={businessLogoRef} 
                  onChange={(e) => handleFileChange(e, 'businessLogo')} 
                  className="image-file-input" 
                  accept="image/*"
                />
                {businessLogoPreview ? (
                  <img src={businessLogoPreview} alt="Logo" className="retailer-photo-preview-img" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <FiUpload size={24} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Upload Shop Logo</span>
                  </div>
                )}
              </div>

              {/* Owner Photo */}
              <div className="retailer-photo-upload-card" onClick={() => ownerPhotoRef.current.click()}>
                <input 
                  type="file" 
                  ref={ownerPhotoRef} 
                  onChange={(e) => handleFileChange(e, 'ownerPhoto')} 
                  className="image-file-input" 
                  accept="image/*"
                />
                {ownerPhotoPreview ? (
                  <img src={ownerPhotoPreview} alt="Owner" className="retailer-photo-preview-img" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <FiUpload size={24} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Upload Owner Photo</span>
                  </div>
                )}
              </div>

              {/* Storefront Photo */}
              <div className="retailer-photo-upload-card" onClick={() => storefrontPhotoRef.current.click()}>
                <input 
                  type="file" 
                  ref={storefrontPhotoRef} 
                  onChange={(e) => handleFileChange(e, 'storefrontPhoto')} 
                  className="image-file-input" 
                  accept="image/*"
                />
                {storefrontPhotoPreview ? (
                  <img src={storefrontPhotoPreview} alt="Storefront" className="retailer-photo-preview-img" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <FiUpload size={24} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Upload Storefront</span>
                  </div>
                )}
              </div>

            </div>
          )}
          
        </div>

        {/* Right Column: Fields Card */}
        <div className="edit-profile-fields-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <FiUser size={24} style={{ color: 'var(--primary)' }} />
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Account & Profile Details</h2>
          </div>

          {/* Basic Fields */}
          <div className="form-group-grid">
            <div className="form-field-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="form-field-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="form-group-grid">
            <div className="form-field-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="form-field-group">
              <label>Role</label>
              <input 
                type="text" 
                value={user?.role} 
                disabled 
                style={{ opacity: 0.6, cursor: 'not-allowed', textTransform: 'capitalize' }}
              />
            </div>
          </div>

          {/* Role specific section divider */}
          <div className="section-divider"></div>

          {/* Customer Specific Settings */}
          {user?.role === 'customer' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <FiSettings size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Notification Settings</h3>
              </div>
              <div className="form-switch-row">
                <div className="form-switch-label-col">
                  <h4>Proximity Alerts</h4>
                  <p>Get notified when followed retailers are within 200m</p>
                </div>
                <input 
                  type="checkbox" 
                  name="proximityAlerts" 
                  checked={formData.proximityAlerts} 
                  onChange={handleChange}
                  style={{ width: 'auto', transform: 'scale(1.3)', cursor: 'pointer' }}
                />
              </div>
            </div>
          )}

          {/* Retailer Specific Settings */}
          {user?.role === 'retailer' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <FiSettings size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Store Configuration</h3>
              </div>

              <div className="form-group-grid">
                <div className="form-field-group">
                  <label>Shop Name</label>
                  <input 
                    type="text" 
                    name="shopName" 
                    value={formData.shopName} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="form-field-group">
                  <label>Business Category</label>
                  <input 
                    type="text" 
                    name="businessCategory" 
                    value={formData.businessCategory} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label>Business Description</label>
                <textarea 
                  name="businessDescription" 
                  value={formData.businessDescription} 
                  onChange={handleChange} 
                  rows="3"
                />
              </div>

              <div className="form-group-grid">
                <div className="form-field-group">
                  <label>GSTIN ID</label>
                  <input 
                    type="text" 
                    name="gstin" 
                    value={formData.gstin} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="form-field-group">
                  <label>Closed On</label>
                  <select name="closedOn" value={formData.closedOn} onChange={handleChange}>
                    <option value="">None</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
              </div>

              <div className="form-group-grid">
                <div className="form-field-group">
                  <label>Open Time</label>
                  <input 
                    type="time" 
                    name="openTime" 
                    value={formData.openTime} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="form-field-group">
                  <label>Close Time</label>
                  <input 
                    type="time" 
                    name="closeTime" 
                    value={formData.closeTime} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div className="form-switch-row" style={{ marginTop: '8px' }}>
                <div className="form-switch-label-col">
                  <h4>Delivery Service</h4>
                  <p>Check if your shop supports order deliveries to customers</p>
                </div>
                <input 
                  type="checkbox" 
                  name="deliveryAvailable" 
                  checked={formData.deliveryAvailable} 
                  onChange={handleChange}
                  style={{ width: 'auto', transform: 'scale(1.3)', cursor: 'pointer' }}
                />
              </div>
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            style={{
              background: 'var(--primary)',
              color: '#fff',
              padding: '12px 28px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              marginTop: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'opacity 0.2s',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
              width: '100%',
              justifyContent: 'center'
            }}
          >
            <FiSave size={18} /> Save Profile Changes
          </button>
        </div>

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

export default EditProfile;
