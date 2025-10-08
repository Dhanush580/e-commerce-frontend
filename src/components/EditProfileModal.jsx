import React, { useState } from 'react';


const emptyAddress = {
  label: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: ''
};

const EditProfileModal = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [editingAddress, setEditingAddress] = useState(null); // index or null
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const baseUrl = import.meta.env.VITE_API_URL || '';
  // Fetch latest addresses on open
  React.useEffect(() => {
    fetch(`${baseUrl}/profile/addresses`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.addresses) setAddresses(data.addresses);
      });
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${baseUrl}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, mobile })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      onSave({ ...data.user, addresses });
      onClose();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Address CRUD
  const handleAddressEdit = (idx) => {
    setEditingAddress(idx);
    setAddressForm(addresses[idx]);
  };
  const handleAddressDelete = async (addressId) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${baseUrl}/profile/addresses/${addressId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete address');
      setAddresses(data.addresses);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };
  const handleAddressFormChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };
  const handleAddressFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res, data;
      if (editingAddress !== null) {
        // Update
        const addressId = addresses[editingAddress]._id;
        res = await fetch(`${baseUrl}/profile/addresses/${addressId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(addressForm)
        });
      } else {
        res = await fetch(`${baseUrl}/profile/addresses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(addressForm)
        });
      }
      data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save address');
      setAddresses(data.addresses);
      setEditingAddress(null);
      setAddressForm(emptyAddress);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };
  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setAddressForm(emptyAddress);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Edit Profile</h2>
        <form onSubmit={handleProfileSave}>
          <label>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          <label>Mobile</label>
          <input value={mobile} onChange={e => setMobile(e.target.value)} placeholder="Your mobile" />
          <h3>Addresses</h3>
          <ul>
            {addresses.map((addr, idx) => (
              <li key={addr._id || idx} style={{ marginBottom: 8 }}>
                <b>{addr.label}</b>: {addr.addressLine1}, {addr.addressLine2}, {addr.city}, {addr.state}, {addr.postalCode}, {addr.country}
                <button type="button" onClick={() => handleAddressEdit(idx)} style={{ marginLeft: 8 }}>Edit</button>
                <button type="button" onClick={() => handleAddressDelete(addr._id)} style={{ marginLeft: 4 }}>Delete</button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={handleAddNewAddress}>Add New Address</button>
          {(editingAddress !== null || addressForm.label) && (
            <form onSubmit={handleAddressFormSubmit} style={{ marginTop: 12, border: '1px solid #ccc', padding: 8 }}>
              <label>Label</label>
              <input name="label" value={addressForm.label} onChange={handleAddressFormChange} required />
              <label>Address Line 1</label>
              <input name="addressLine1" value={addressForm.addressLine1} onChange={handleAddressFormChange} required />
              <label>Address Line 2</label>
              <input name="addressLine2" value={addressForm.addressLine2} onChange={handleAddressFormChange} />
              <label>City</label>
              <input name="city" value={addressForm.city} onChange={handleAddressFormChange} required />
              <label>State</label>
              <input name="state" value={addressForm.state} onChange={handleAddressFormChange} required />
              <label>Postal Code</label>
              <input name="postalCode" value={addressForm.postalCode} onChange={handleAddressFormChange} required />
              <label>Country</label>
              <input name="country" value={addressForm.country} onChange={handleAddressFormChange} required />
              <button type="submit" disabled={loading}>{editingAddress !== null ? 'Update Address' : 'Add Address'}</button>
              <button type="button" onClick={() => { setEditingAddress(null); setAddressForm(emptyAddress); }}>Cancel</button>
            </form>
          )}
          {error && <div className="error">{error}</div>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
