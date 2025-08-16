// components/SlotParkir.js
export default function SlotParkir({ slotId, status, onBook }) {
  const isAvailable = status === 'kosong';

  return (
    <div className={`p-6 rounded-lg shadow-lg text-center ${isAvailable ? 'bg-green-100' : 'bg-red-100'}`}>
      <h3 className="text-xl font-semibold mb-2">{slotId.toUpperCase()}</h3>
      <p className={`text-lg font-medium ${isAvailable ? 'text-green-700' : 'text-red-700'}`}>
        Status: {isAvailable ? 'Kosong' : 'Terisi'}
      </p>
      {isAvailable && (
        <button
          onClick={() => onBook(slotId)}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors"
        >
          Booking
        </button>
      )}
    </div>
  );
}