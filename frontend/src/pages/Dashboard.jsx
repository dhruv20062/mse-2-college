import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, Plus, Search, Trash2, Edit3, CheckCircle, Clock } from 'lucide-react';
import API_URL from '../config';

const Dashboard = () => {
  const [grievances, setGrievances] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Academic',
    status: 'Pending'
  });
  const [selectedGrievance, setSelectedGrievance] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const fetchGrievances = async (query = '') => {
    try {
      const url = query 
        ? `${API_URL}/grievances/search?title=${query}` 
        : `${API_URL}/grievances`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGrievances(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchGrievances(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_URL}/grievances/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/grievances`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setFormData({ title: '', description: '', category: 'Academic', status: 'Pending' });
      setShowForm(false);
      setEditId(null);
      fetchGrievances();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this grievance?')) {
      try {
        await axios.delete(`${API_URL}/grievances/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchGrievances();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEdit = (g) => {
    setFormData({ title: g.title, description: g.description, category: g.category, status: g.status });
    setEditId(g._id);
    setShowForm(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="container">
      <nav className="dashboard-nav">
        <h2 className="logo">Student Grievance Port</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Hello, {user?.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="grid-layout">
        {/* Sidebar / Form */}
        <div>
          <button 
            onClick={() => { setShowForm(!showForm); setEditId(null); setFormData({ title: '', description: '', category: 'Academic', status: 'Pending' }); }} 
            className="btn btn-primary" 
            style={{ marginBottom: '1.5rem' }}
          >
            {showForm ? 'Cancel' : <><Plus size={18} /> New Grievance</>}
          </button>

          {showForm && (
            <div className="glass-card">
              <h3 style={{ marginBottom: '1.5rem' }}>{editId ? 'Update Grievance' : 'Submit New Grievance'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input 
                    className="form-input" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option>Academic</option>
                    <option>Hostel</option>
                    <option>Transport</option>
                    <option>Other</option>
                  </select>
                </div>
                {editId && (
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select 
                      className="form-input"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option>Pending</option>
                      <option>Resolved</option>
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-input" 
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                  {editId ? 'Update Grievance' : 'Submit'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div>
          <div className="search-bar">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search grievances by title..." 
              value={search}
              onChange={handleSearch}
            />
          </div>

          <div className="grievance-list">
            {loading ? (
              <p className="empty-state">Loading grievances...</p>
            ) : grievances.length === 0 ? (
              <div className="empty-state">
                <p>No grievances found.</p>
              </div>
            ) : (
              grievances.map(g => (
                <div key={g._id} className="grievance-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{g.title}</h4>
                      <span className="badge badge-pending" style={{ marginRight: '0.5rem' }}>{g.category}</span>
                      <span className={`badge ${g.status === 'Resolved' ? 'badge-resolved' : 'badge-pending'}`}>
                        {g.status === 'Resolved' ? <CheckCircle size={12} /> : <Clock size={12} />} {g.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setSelectedGrievance(g)} className="btn btn-secondary" style={{ width: 'auto', padding: '0.4rem' }}>
                        <Search size={16} />
                      </button>
                      <button onClick={() => handleEdit(g)} className="btn btn-secondary" style={{ width: 'auto', padding: '0.4rem' }}>
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDelete(g._id)} className="btn btn-danger" style={{ width: 'auto', padding: '0.4rem' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{g.description}</p>
                  <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                    Submitted on {new Date(g.date).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* View Modal */}
      {selectedGrievance && (
        <div className="modal-overlay" onClick={() => setSelectedGrievance(null)}>
          <div className="glass-card modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ marginBottom: '0.5rem' }}>{selectedGrievance.title}</h2>
                <span className="badge badge-pending" style={{ marginRight: '0.5rem' }}>{selectedGrievance.category}</span>
                <span className={`badge ${selectedGrievance.status === 'Resolved' ? 'badge-resolved' : 'badge-pending'}`}>
                  {selectedGrievance.status}
                </span>
              </div>
              <button onClick={() => setSelectedGrievance(null)} className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem' }}>Close</button>
            </div>
            <div className="form-label">Description</div>
            <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>{selectedGrievance.description}</p>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Submitted on {new Date(selectedGrievance.date).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
