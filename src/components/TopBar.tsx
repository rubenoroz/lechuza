'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const TopBar = () => {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderUserMenu = () => {
    if (status === 'loading') {
      return <div className="h-5 w-24 bg-gray-700 rounded animate-pulse"></div>;
    }

    if (status === 'authenticated' && session?.user) {
      return (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center text-sm text-gray-300 hover:text-white focus:outline-none"
          >
            {session.user.name}
            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Dashboard
              </Link>
              {session.user.isSuperAdmin && (
                <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Administración
                </Link>
              )}
              {session.user.isProfesor && (
                <Link href="/profesor/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Panel de Profesor
                </Link>
              )}
              {session.user.isEnrollmentAdmin && (
                <Link href="/enrollment-admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Panel de Control Escolar
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <>
        <Link href="/login" className="text-sm text-gray-300 hover:text-white mr-4">Iniciar Sesión</Link>
        <Link href="/register" className="text-sm text-gray-300 hover:text-white">Registro</Link>
      </>
    );
  };

  return (
    <div className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-2 flex justify-end items-center h-10">
        {renderUserMenu()}
      </div>
    </div>
  );
};

export default TopBar;