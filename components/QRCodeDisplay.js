import QRCode from "react-qr-code";

export default function QRCodeDisplay({ bookedSlot }) {
  if (!bookedSlot) {
    return null;
  }

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-lg text-center">
      <h2 className="text-2xl font-bold mb-4">QR Code untuk Keluar</h2>
      <p className="mb-4">Pindai kode ini saat Anda ingin keluar dari slot <span className="font-bold">{bookedSlot.id.toUpperCase()}</span>.</p>
      <div className="flex justify-center mb-4">
        <QRCode value={bookedSlot.qrCode} />
      </div>
      <p className="text-sm text-gray-500">
        Kode unik: {bookedSlot.qrCode}
      </p>
    </div>
  );
}