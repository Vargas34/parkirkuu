import { useState, useEffect, useRef } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyD5DlldflHFLbf1WOMIFEDHH512ZKfCCF0",
  authDomain: "parkir-8e631.firebaseapp.com",
  databaseURL: "https://parkir-8e631-default-rtdb.firebaseio.com",
  projectId: "parkir-8e631",
  storageBucket: "parkir-8e631.appspot.com",
  messagingSenderId: "214391307323",
  appId: "1:214391307323:web:81656c5bcd6280f782b01e",
  measurementId: "G-J3XLN9ZE8B",
};

// Init Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

export default function ParkingMonitor() {
  const [parkingData, setParkingData] = useState({});
  const [qrCodes, setQrCodes] = useState({});
  const [openQR, setOpenQR] = useState(null); // slot yang QR-nya terbuka
  const QRCodeLibRef = useRef(null);

  useEffect(() => {
    // load library QRCode sekali saja
    const loadQRCode = async () => {
      const qrcodeModule = await import("qrcode");
      QRCodeLibRef.current = qrcodeModule.default;
    };
    loadQRCode();

    // ambil data realtime dari Firebase
    const parkingRef = ref(db, "parking");
    const unsubscribe = onValue(parkingRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setParkingData(data);
      } else {
        setParkingData({});
      }
    });

    return () => unsubscribe();
  }, []);

  // generate QR hanya ketika tombol ditekan
 const handleShowQR = async (slotId, kodeQR) => {
  if (!QRCodeLibRef.current) return;

  try {
    // kalau tidak ada kodeQR dari Firebase, pakai slotId sebagai fallback
    const qrContent = kodeQR || `PARKIR-${slotId}`;

    const qrUrl = await QRCodeLibRef.current.toDataURL(qrContent);
    setQrCodes((prev) => ({ ...prev, [slotId]: qrUrl }));
    setOpenQR(slotId);
  } catch (err) {
    console.error("Gagal membuat QR Code:", err);
  }
};


  return (
    <div className="bg-gray-800 text-gray-100 min-h-screen p-6 sm:p-10 font-sans">
      <header className="text-center mb-8 pb-6 border-b-2 border-gray-700">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-400">
          Monitor Slot Parkir
        </h1>
        <p className="mt-2 text-gray-400 text-sm sm:text-base">
          Status parkir 
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
