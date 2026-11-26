import { useEffect, useState } from 'react';
import {Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      const [cRes, oRes] = await Promise.all([
        api.get('/admin/complaints'),
        api.get('/admin/officers'),
      ]);
      setComplaints(cRes.data.complaints);
      setOfficers(oRes.data.officers);
    } catch {
      setError('Could not load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (complaintId) => {
    const officerId = selected[complaintId];
    if (!officerId) {
      setMessage('');
      setError('Please select an officer first');
      return;
    }
    setError('');
    setMessage('');
    try {
      await api.patch(`/admin/complaints/${complaintId}/assign`, { officer_id: officerId });
      setMessage(`Complaint #${complaintId} assigned successfully`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not assign complaint');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">CivicTrack Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Hi, {user.name}</span>
            <button onClick={handleLogout} className="text-sm text-red-600 underline">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          All Complaints ({complaints.length})
        </h2>

        {message && (
          <p className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded-lg mb-3">{message}</p>
        )}
        {error && (
          <p className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-3">{error}</p>
        )}
        {loading && <p className="text-gray-600">Loading...</p>}

        {!loading && (
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Citizen</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Officer</th>
                  <th className="px-4 py-3">Assign</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-4 py-3">#{c.id}</td>
                    <td className="px-4 py-3 font-medium">
                         <Link to={`/complaints/${c.id}`} className="text-gray-800 hover:text-blue-600 hover:underline">
                                {c.title}
                         </Link>
                    </td>   
                    <td className="px-4 py-3">{c.category}</td>
                    <td className="px-4 py-3">{c.citizen_name}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3">{c.officer_name || '-'}</td>
                    <td className="px-4 py-3">
                      {c.status === 'Resolved' ? (
                        <span className="text-gray-400">Done</span>
                      ) : (
                        <div className="flex gap-2">
                          <select
                            value={selected[c.id] || ''}
                            onChange={(e) => setSelected({ ...selected, [c.id]: e.target.value })}
                            className="border border-gray-300 rounded-lg px-2 py-1"
                          >
                            <option value="">Select officer</option>
                            {officers.map((o) => (
                              <option key={o.id} value={o.id}>
                                {o.name} ({o.department})
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssign(c.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                          >
                            Assign
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {complaints.length === 0 && (
              <p className="p-4 text-gray-600">No complaints yet.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}