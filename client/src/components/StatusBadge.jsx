const styles = {
  Submitted: 'bg-gray-100 text-gray-700',
  'Under Review': 'bg-yellow-100 text-yellow-800',
  Assigned: 'bg-purple-100 text-purple-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  Resolved: 'bg-green-100 text-green-800',
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
        styles[status] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {status}
    </span>
  );
}