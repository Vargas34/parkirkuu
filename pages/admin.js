// pages/admin.js
import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, set, update } from 'firebase/database';
import { db } from '../firebase/init';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

const AdminHeader = () => {
  return (
    <header className="bg-gray-900 text-white p-6 shadow-xl">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-3xl font-extrabold tracking-wide text-blue-400">
          Parkir Pintar (Admin)
        </Link>
        <ul className="flex space-x-6">
          <li>
            <Link href="/" className="text-lg font-medium text-gray-300 hover:text-blue-400 transition-colors duration-300">
              Kembali ke Beranda
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 p-6 mt-auto text-center shadow-inner">
      <p className="text-sm">&copy; 2023 Parkir Pintar. All rights reserved.</p>
    </footer>
  );
};

export default function AdminPage() {
  const [slotData, setSlotData] = useState(null);
  const [newSlotId, setNewSlotId] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const parkingRef = ref(db, 'parking');
    const unsubscribe = onValue(parkingRef, (snapshot) => {
      const data = snapshot.val();
      setSlotData(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Tambah slot baru
  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlotId.trim()) {
      setMessage('ID slot tidak boleh kosong.');
      return;
    }

    const slotRef = ref(db, `parking/${newSlotId}`);
    try {
      if (slotData && slotData[newSlotId]) {
        setMessage(`Slot dengan ID '${newSlotId}' sudah ada.`);
        return;
      }

      await set(slotRef, {
        status: 'kosong',
        kodeQR: ''
      });

      setMessage(`Slot '${newSlotId}' berhasil ditambahkan.`);
      setNewSlotId('');
    } catch (error) {
      console.error("Gagal menambahkan slot:", error);
      setMessage('Terjadi kesalahan saat menambahkan slot.');
    }
  };

  // Ubah status slot
  const handleToggleStatus = async (slotId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'kosong' ? 'terisi' : 'kosong';
      const updates = {
        status: newStatus,
        kodeQR: newStatus === 'terisi' ? uuidv4() : '' // generate kode unik
      };

      await update(ref(db, `parking/${slotId}`), updates);
      setMessage(`Slot '${slotId}' berhasil diubah ke '${newStatus}'.`);
    } catch (error) {
      console.error("Gagal mengubah status slot:", error);
      setMessage("Terjadi kesalahan saat mengubah status slot.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-gray-200">
        <p className="text-2xl animate-pulse">Memuat data...</p>
      </div>
    );
  }

  const slotIds = slotData ? Object.keys(slotData) : [];

  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-gray-100">
      <AdminHeader />
      <main className="container mx-auto px-6 py-12 flex-1">
        <h1 className="text-5xl font-extrabold mb-10 text-center text-blue-400">Halaman Admin</h1>
        
        {/* Form tambah slot */}
        <div className="bg-gray-700 p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto transform transition-transform duration-300 hover:scale-105">
          <h2 className="text-3xl font-bold mb-6 text-white">Tambahkan Slot Parkir Baru</h2>
          <form onSubmit={handleAddSlot} className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={newSlotId}
              onChange={(e) => setNewSlotId(e.target.value.toLowerCase())}
              placeholder="Contoh: slot3"
              className="flex-1 p-4 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 placeholder-gray-500"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Tambah Slot
            </button>
          </form>
          {message && (
            <p className={`mt-4 text-center font-medium ${message.includes('berhasil') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
        </div>
        
        {/* Daftar slot */}
        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center text-white">Daftar Slot Tersedia</h2>
          {slotIds.length > 0 ? (
            <ul className="bg-gray-700 p-8 rounded-2xl shadow-2xl space-y-4">
              {slotIds.map((id) => (
                <li 
                  key={id} 
                  className={`p-5 rounded-xl flex justify-between items-center transition-all duration-300 transform hover:scale-105 ${
                    slotData[id].status === 'kosong' ? 'bg-green-600/20' : 'bg-red-600/20'
                  }`}
                >
                  <div>
                    <span className="font-semibold text-xl text-white">{id.toUpperCase()}</span>
                    <span className={`ml-3 font-bold text-lg px-4 py-1 rounded-full ${
                      slotData[id].status === 'kosong' ? 'bg-green-500 text-green-900' : 'bg-red-500 text-red-900'
                    }`}>
                      {slotData[id].status.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(id, slotData[id].status)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 transition-colors"
                  >
                    Ubah Status
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-400 italic mt-6">Belum ada slot parkir yang dibuat.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
