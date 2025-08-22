import React, { useState, useEffect, useRef } from "react";
// Import semua modul Firebase yang diperlukan
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth, signInWithCustomToken, signInAnonymously } from "firebase/auth";

// Import ikon dari lucide-react untuk UI yang lebih baik
import { ParkingSquare } from "lucide-react";

export default function ParkingMonitor() {
  // State untuk menyimpan data dari database
  const [parkingData, setParkingData] = useState({});
  // State untuk melacak status otentikasi dan kesiapan aplikasi
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States untuk QR Code
  const [qrCodes, setQrCodes] = useState({});
  const [openQR, setOpenQR] = useState(null);
  const QRCodeLibRef = useRef(null);

  // Inisialisasi Firebase dan Otentikasi
  useEffect(() => {
    // Memastikan variabel global ada
    if (typeof __firebase_config === 'undefined' || typeof __app_id === 'undefined' || typeof __initial_auth_token === 'undefined') {
      console.error("Firebase global variables are not defined. The app will not function correctly.");
      setError("Error: Firebase variables missing. Please check the environment.");
      setLoading(false);
      return;
    }

    try {
      // Parse konfigurasi Firebase dari string JSON
      const firebaseConfig = JSON.parse(__firebase_config);
      // Inisialisasi Firebase
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      const auth = getAuth(app);
      
      // Lakukan otentikasi dengan token khusus atau secara anonim
      const authenticate = async () => {
        try {
          if (__initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }
          console.log("Authentication successful.");
          setIsAuthReady(true);
        } catch (e) {
          console.error("Authentication failed:", e);
          setError("Failed to authenticate. Check the token and try again.");
          setLoading(false);
        }
      };
      authenticate();
    } catch (e) {
      console.error("Firebase initialization failed:", e);
      setError("Failed to initialize Firebase. Check the configuration.");
      setLoading(false);
    }

    // Memuat pustaka QR Code secara dinamis
    const loadQRCode = async () => {
      try {
        const qrcodeModule = await import("qrcode");
        QRCodeLibRef.current = qrcodeModule.default;
      } catch (err) {
        console.error("Failed to load QR code library:", err);
      }
    };
    loadQRCode();
  }, []);

  // Ambil data real-time dari Firebase setelah otentikasi siap
  useEffect(() => {
    if (!isAuthReady) return;

    const db = getDatabase();
    // Gunakan path Realtime Database yang sesuai dengan aturan keamanan
    const parkingRef = ref(db, `artifacts/${__app_id}/public/data/parking`);

    // Tambahkan listener real-time
    const unsubscribe = onValue(parkingRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setParkingData(data);
      } else {
        setParkingData({});
      }
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Firebase fetch error:", err);
      setError("Gagal mengambil data dari database.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthReady]); // Efek ini bergantung pada status otentikasi

  // Fungsi untuk membuat dan menampilkan QR Code
  const handleShowQR = async (slotId, qrCodeValue) => {
    if (!QRCodeLibRef.current) return;

    try {
      // Jika tidak ada nilai QR dari database, gunakan slotId sebagai fallback
      const qrContent = qrCodeValue || `PARKIR-${slotId}`;
      const qrUrl = await QRCodeLibRef.current.toDataURL(qrContent);
      setQrCodes((prev) => ({ ...prev, [slotId]: qrUrl }));
      setOpenQR(slotId);
    } catch (err) {
      console.error("Gagal membuat QR Code:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-800 text-gray-100">
        <p>Memuat data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-800 text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 text-gray-100 min-h-screen p-6 sm:p-10 font-sans">
      <header className="text-center mb-8 pb-6 border-b-2 border-gray-700">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-400">
          Monitor Slot Parkir
        </h1>
        <p className="mt-2 text-gray-400 text-sm sm:text-base">
          Status parkir ter-update secara real-time
        </p>
      </header>
      <div className="flex flex-wrap justify-center gap-6">
        {Object.keys(parkingData).length > 0 ? (
          Object.keys(parkingData).map((slotId) => {
            const slot = parkingData[slotId];
            const isOccupied = slot.status === "terisi";
            const borderColor = isOccupied ? "border-red-500" : "border-green-500";
            const bgColor = isOccupied ? "bg-red-900/40" : "bg-green-900/40";
            return (
              <div
                key={slotId}
                className={`w-full sm:w-80 md:w-96 p-6 rounded-xl shadow-xl border-2 ${borderColor} ${bgColor} transition-transform duration-300 transform hover:scale-105 flex flex-col items-center text-center`}
              >
                <ParkingSquare size={48} className={`mb-4 ${isOccupied ? "text-red-400" : "text-green-400"}`} />
                <h3 className="text-2xl font-bold mb-2 text-white capitalize">
                  {slotId.replace("slot", "Slot ")}
                </h3>
                <p className="text-lg font-medium">
                  Status:
                  <span
                    className={`ml-2 font-bold capitalize ${
                      isOccupied ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {slot.status}
                  </span>
                </p>
                {!isOccupied && (
                  <>
                    {openQR === slotId && qrCodes[slotId] ? (
                      <>
                        <p className="mt-4 text-gray-300">Kode QR untuk Masuk:</p>
                        <img
                          src={qrCodes[slotId]}
                          alt={`QR ${slotId}`}
                          className="mt-2 w-48 h-48 rounded-lg border-4 border-gray-700 shadow-md"
                        />
                        <button
                          className="mt-4 px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                          onClick={() => setOpenQR(null)}
                        >
                          Tutup QR
                        </button>
                      </>
                    ) : (
                      <button
                        className="mt-4 px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={() => handleShowQR(slotId, slot.kodeQR)}
                      >
                        Tampilkan QR
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-gray-400 italic">Belum ada data slot parkir.</p>
        )}
      </div>
    </div>
  );
}
