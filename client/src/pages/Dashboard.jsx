import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate , Link} from 'react-router-dom';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) return <p className="p-6">Loading...</p>;
  if (!user) return <p className="p-6">You are not logged in.</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-blue-50">
      <h1 className="text-2xl font-bold text-blue-600">Welcome, {user.name}</h1>
      <p className="text-gray-700">Role: {user.role}</p>
      <Link
        to="/complaints/new"
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"> submit a complaint
      </Link>
      <button
        onClick={() => { logout(); navigate('/login'); }}
        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
        Logout
      </button>
    </div>
  );
}