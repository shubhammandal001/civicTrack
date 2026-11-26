import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import CitizenDashboard from './CitizenDashboard.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import OfficerDashboard from './OfficerDashboard.jsx';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (user.role === 'citizen') {
    return <CitizenDashboard />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user.role === 'officer') {
    return <OfficerDashboard />;
  }

  // Officer / admin ke dashboards baad me banenge
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-blue-50">
      <h1 className="text-2xl font-bold text-blue-600">Welcome, {user.name}</h1>
      <p className="text-gray-700">Role: {user.role}</p>
      <button
        onClick={() => { logout(); navigate('/login'); }}
        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}