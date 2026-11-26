import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { FILE_BASE_URL } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const NEXT_STATUS = { Assigned: 'In Progress', 'In Progress': 'Resolved' };
const BUTTON_LABEL = { Assigned: 'Start Work', 'In Progress': 'Mark Resolved' };

export default function OfficerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const loadComplaints = async () => {
    try {
      const res = await api.get('/officer/complaints');
      setComplaints(res.data.complaints);
    } catch {
      setError('Could not load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const openPanel = (id) => {
    setActiveId(id);
    setRemarks('');
    setImages([]);
    setError('');
    setMessage('');
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      setError('You can upload at most 3 photos');
      e.target.value = '';
      setImages([]);
      return;
    }
    setError('');
    setImages(files);
  };

  const handleUpdate = async (c) => {
    setSaving(true);
    setError('');
    try {
      const data = new FormData();
      data.append('status', NEXT_STATUS[c.status]);
      data.append('remarks', remarks);
      images.forEach((img) => data.append('images', img));

      await api.patch(`/officer/complaints/${c.id}/status`, data);
      setMessage(`Complaint #${c.id} marked as ${NEXT_STATUS[c.status]}`);
      setActiveId(null);
      await loadComplaints();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update status');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">CivicTrack Officer</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Hi, {user.name}</span>
            <button onClick={handleLogout} className="text-sm text-red-600 underline">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">My Assigned Complaints</h2>

        {message && (
          <p className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded-lg mb-3">{message}</p>
        )}
        {error && (
          <p className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-3">{error}</p>
        )}
        {loading && <p className="text-gray-600">Loading...</p>}
        {!loading && complaints.length === 0 && (
          <p className="text-gray-600">No complaints assigned to you yet.</p>
        )}

        <div className="space-y-3">
          {complaints.map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow p-4">
              <div className="flex gap-4">
                {c.thumbnail ? (
                  <img
                    src={`${FILE_BASE_URL}/${c.thumbnail}`}
                    alt=""
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                    No photo
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-800 truncate">{c.title}</h3>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-sm text-gray-500">
                    #{c.id} · {c.category} · by {c.citizen_name}
                  </p>
                  {c.address && <p className="text-sm text-gray-500 truncate">{c.address}</p>}

                  {NEXT_STATUS[c.status] ? (
                    <button
                      onClick={() => openPanel(c.id)}
                      className="mt-2 bg-blue-600 text-white text-sm px-3 py-1 rounded-lg hover:bg-blue-700"
                    >
                      {BUTTON_LABEL[c.status]}
                    </button>
                  ) : (
                    <p className="mt-2 text-sm text-green-700">Completed</p>
                  )}
                </div>
              </div>

              {activeId === c.id && (
                <div className="mt-3 border-t pt-3 space-y-3">
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Remarks (optional)"
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />

                  {NEXT_STATUS[c.status] === 'Resolved' && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Resolution photos (optional, max 3)
                      </label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleImages}
                        className="text-sm"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(c)}
                      disabled={saving}
                      className="bg-green-600 text-white text-sm px-3 py-1 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : `Confirm: ${NEXT_STATUS[c.status]}`}
                    </button>
                    <button
                      onClick={() => setActiveId(null)}
                      className="text-sm text-gray-600 underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}