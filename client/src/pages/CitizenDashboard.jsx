import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { FILE_BASE_URL } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function CitizenDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/complaints/my')
      .then((res) => setComplaints(res.data.complaints))
      .catch(() => setError('Could not load your complaints'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">CivicTrack</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Hi, {user.name}</span>
            <button onClick={handleLogout} className="text-sm text-red-600 underline">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">My Complaints</h2>
          <Link
            to="/complaints/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            + Report an Issue
          </Link>
        </div>

        {loading && <p className="text-gray-600">Loading...</p>}

        {error && (
          <p className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</p>
        )}

        {!loading && !error && complaints.length === 0 && (
          <p className="text-gray-600">You have not reported any issues yet.</p>
        )}

        <div className="space-y-3">
          {complaints.map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow p-4 flex gap-4">
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
                  {c.category} · {new Date(c.created_at).toLocaleDateString()}
                </p>
                {c.address && <p className="text-sm text-gray-500 truncate">{c.address}</p>}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}