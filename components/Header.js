// components/Header.js
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Parkir Pintar
        </Link>
        <ul className="flex space-x-4">
          <li>
            <Link href="/" className="hover:text-gray-400">
              Beranda
            </Link>
          </li>
          <li>
            <Link href="/parkir" className="hover:text-gray-400">
              Booking Parkir
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}