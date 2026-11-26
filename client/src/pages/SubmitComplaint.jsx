import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import MapPicker from '../components/MapPicker.jsx';

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', category_id: '', address: '' });
  const [location, setLocation] = useState(null);
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    api.get('/categories')
      .then((res) => setCategories(res.data.categories))
      .catch(() => setError('Could not load categories'));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Location is not supported in this browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setError('');
        setLocating(false);
      },
      () => {
        setError('Could not get your location. Please allow location access.');
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      setError('Please detect your location first');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('description', form.description);
      data.append('category_id', form.category_id);
      data.append('address', form.address);
      data.append('latitude', location.lat);
      data.append('longitude', location.lng);
      images.forEach((img) => data.append('images', img));

      await api.post('/complaints', data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400';

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-6 rounded-xl shadow space-y-4">
        <h1 className="text-2xl font-bold text-blue-600 text-center">Report an Issue</h1>

        {error && (
          <p className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</p>
        )}

        <input name="title" placeholder="Title (e.g. Pothole near main road)" value={form.title}
          onChange={handleChange} className={inputClass} maxLength={200} required />

        <textarea name="description" placeholder="Describe the problem" rows={4}
          value={form.description} onChange={handleChange} className={inputClass} required />

        <select name="category_id" value={form.category_id} onChange={handleChange}
          className={inputClass} required>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <input name="address" placeholder="Landmark / address (optional)" value={form.address}
          onChange={handleChange} className={inputClass} />

       <div className="space-y-2">
            <button type="button" onClick={detectLocation} disabled={locating}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
                {locating ? 'Detecting...' : 'Use my current location'}
            </button>

            <MapPicker location={location} onPick={setLocation} />

            <p className="text-sm text-gray-600">
            {location? `Location set: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`: 'Or tap on the map to place a pin'}
            </p>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Photos (max 3, JPG/PNG/WEBP)</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple
            onChange={handleImages} className="text-sm" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>

        <Link to="/dashboard" className="block text-center text-sm text-blue-600 underline">
          Back to dashboard
        </Link>
      </form>
    </div>
  );
}