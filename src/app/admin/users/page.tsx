'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Pagination from '@/components/Pagination';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const fetchUsers = useCallback(async (page: number) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/users?page=${page}&limit=10`);
      if (res.ok) {
        const { data, pagination } = await res.json();
        setUsers(data);
        setTotalPages(pagination.totalPages);
        setTotalItems(pagination.totalItems);
        setCurrentPage(pagination.currentPage);
      } else {
        setError('Error al cargar los usuarios');
      }
    } catch (err) {
      setError('Error de red o de servidor');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, fetchUsers]);

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Refresh the current page after delete
        fetchUsers(currentPage);
      } else {
        const data = await res.json();
        setError(data.message || 'Error al eliminar el usuario');
      }
    }
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getUserRoles = (user: any) => {
    const roles = [];
    if (user.isSuperAdmin) roles.push('Super Administrador');
    if (user.isEnrollmentAdmin) roles.push('Admin de Control Escolar');
    if (user.isProfesor) roles.push('Profesor');
    if (user.isStudent) roles.push('Estudiante');
    return roles.join(', ') || 'Ninguno';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Administración de Usuarios</h1>
        <div className="flex space-x-4">
          <Link href="/api/admin/users/export" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Descargar CSV
          </Link>
          <Link href="/admin/users/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Añadir Nuevo Usuario
          </Link>
        </div>
      </div>

      {error && <p className="text-red-500 italic mb-4">{error}</p>}

      <div className="bg-white shadow-md rounded my-6">
        {isLoading ? (
          <div className="text-center p-10">Cargando...</div>
        ) : (
          <>
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nombre</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Roles</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{`${user.nombres} ${user.apellido_paterno} ${user.apellido_materno || ''}`}</p></td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{user.email}</p></td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{getUserRoles(user)}</p></td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                      <Link href={`/admin/users/edit/${user.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</Link>
                      <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
              <span className="text-xs xs:text-sm text-gray-900">
                Mostrando {users.length} de {totalItems} Usuarios
              </span>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
