'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Cargando Dashboard...</h1>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-700">Por favor, <Link href="/login" className="text-blue-500 hover:underline">inicia sesión</Link> para acceder a tu dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Bienvenido a tu Dashboard, {session?.user?.name}!</h1>
        <p className="text-gray-700 mb-6">Aquí tienes tus accesos rápidos:</p>
        
        <div className="space-y-4">
          {session?.user?.isStudent && (
            <Link href="/student/dashboard" className="block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
              Mis Cursos como Alumno
            </Link>
          )}
          {session?.user?.isProfesor && (
            <Link href="/instructor/dashboard" className="block bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
              Mis Cursos como Instructor
            </Link>
          )}
          {session?.user?.isSuperAdmin && (
            <Link href="/admin" className="block bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
              Panel de Super Administración
            </Link>
          )}
          {session?.user?.isEnrollmentAdmin && (
            <Link href="/enrollment-admin/dashboard" className="block bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
              Panel de Control Escolar
            </Link>
          )}
        </div>
        <p className="text-gray-500 mt-6">¡Más funcionalidades en construcción!</p>
      </div>
    </div>
  );
}