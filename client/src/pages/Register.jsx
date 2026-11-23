import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400';

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-xl shadow space-y-4">
        <h1 className="text-2xl font-bold text-blue-600 text-center">Create Account</h1>

        {error && (
          <p className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</p>
        )}

        <input name="name" placeholder="Full name" value={form.name}
          onChange={handleChange} className={inputClass} required />
        <input name="email" type="email" placeholder="Email" value={form.email}
          onChange={handleChange} className={inputClass} required />
        <input name="phone" placeholder="Phone (optional)" value={form.phone}
          onChange={handleChange} className={inputClass} />
        <input name="password" type="password" placeholder="Password (min 6 characters)"
          value={form.password} onChange={handleChange} className={inputClass} required />

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 underline">Login</Link>
        </p>
      </form>
    </div>
  );
}