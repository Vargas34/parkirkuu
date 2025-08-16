// pages/index.js
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800">
          Selamat Datang di <span className="text-blue-600">Parkir Pintar</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-gray-600">
          Solusi parkir otomatis untuk kenyamanan Anda.
        </p>

        <div className="flex flex-col md:flex-row mt-8 space-y-4 md:space-y-0 md:space-x-4">
          <Link href="/parkir" className="w-full md:w-auto px-8 py-3 bg-blue-500 text-white font-bold rounded-lg shadow-lg hover:bg-blue-600 transition-colors">
            Mulai Booking
          </Link>
        </div>
      </main>
    </div>
  );
}