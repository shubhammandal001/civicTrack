import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { FILE_BASE_URL } from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import MapView from '../components/MapView.jsx';

function PhotoGrid({ images }) {
  return (
    <div className="flex flex-wrap gap-2">
      {images.map((img) => (
        <a key={img.id} href={`${FILE_BASE_URL}/${img.image_path}`} target="_blank" rel="noreferrer">
          <img
            src={`${FILE_BASE_URL}/${img.image_path}`}
            alt=""
            className="w-28 h-28 object-cover rounded-lg border"
          />
        </a>
      ))}
    </div>
  );
}

export default function ComplaintDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/complaints/${id}`)
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(err.response?.status === 404 ? 'Complaint not found' : 'Could not load complaint')
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;

  if (error) {
    return (
      <div className="p-6 space-y-3">
        <p className="text-red-600">{error}</p>
        <Link to="/dashboard" className="text-blue-600 underline">Back to dashboard</Link>
      </div>
    );
  }

  const { complaint, images, history } = data;
  const complaintImages = images.filter((i) => i.type === 'complaint');
  const resolutionImages = images.filter((i) => i.type === 'resolution');

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <Link to="/dashboard" className="text-blue-600 underline text-sm">
          &larr; Back to dashboard
        </Link>

        <div className="bg-white rounded-xl shadow p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl font-bold text-gray-800">{complaint.title}</h1>
            <StatusBadge status={complaint.status} />
          </div>
          <p className="text-sm text-gray-500">
            #{complaint.id} · {complaint.category} · {new Date(complaint.created_at).toLocaleDateString()}
          </p>
          <p className="text-gray-700 whitespace-pre-line">{complaint.description}</p>
          {complaint.address && (
            <p className="text-sm text-gray-600">Address: {complaint.address}</p>
          )}
          <p className="text-sm text-gray-600">
            Assigned officer: {complaint.officer_name || 'Not assigned yet'}
          </p>
        </div>

        {complaintImages.length > 0 && (
          <div className="bg-white rounded-xl shadow p-5 space-y-2">
            <h2 className="font-semibold text-gray-800">Photos</h2>
            <PhotoGrid images={complaintImages} />
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-5 space-y-2">
          <h2 className="font-semibold text-gray-800">Location</h2>
          <MapView lat={Number(complaint.latitude)} lng={Number(complaint.longitude)} />
        </div>

        <div className="bg-white rounded-xl shadow p-5 space-y-3">
          <h2 className="font-semibold text-gray-800">Progress</h2>
          <ol className="relative border-l-2 border-blue-200 ml-2 space-y-4">
            {history.map((h) => (
              <li key={h.id} className="ml-4">
                <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-blue-600" />
                <div className="flex items-center gap-2">
                  <StatusBadge status={h.new_status} />
                  <span className="text-xs text-gray-500">
                    {new Date(h.created_at).toLocaleString()}
                  </span>
                </div>
                {h.remarks && <p className="text-sm text-gray-600 mt-1">{h.remarks}</p>}
                {h.changed_by_name && (
                  <p className="text-xs text-gray-400">by {h.changed_by_name}</p>
                )}
              </li>
            ))}
          </ol>
        </div>

        {resolutionImages.length > 0 && (
          <div className="bg-white rounded-xl shadow p-5 space-y-2">
            <h2 className="font-semibold text-gray-800">Resolution photos</h2>
            <PhotoGrid images={resolutionImages} />
          </div>
        )}
      </div>
    </div>
  );
}