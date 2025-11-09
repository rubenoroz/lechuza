'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Pagination from '@/components/Pagination'; // Import the new component

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const fetchCourses = useCallback(async (page: number) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/courses?page=${page}&limit=10`);
      if (res.ok) {
        const { data, pagination } = await res.json();
        setCourses(data);
        setTotalPages(pagination.totalPages);
        setTotalItems(pagination.totalItems);
        setCurrentPage(pagination.currentPage);
      } else {
        setError('Error al cargar los cursos');
      }
    } catch (err) {
      setError('Error de red o de servidor');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses(currentPage);
  }, [currentPage, fetchCourses]);

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este curso?')) {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Refresh the current page after delete
        fetchCourses(currentPage);
      } else {
        const data = await res.json();
        setError(data.message || 'Error al eliminar el curso');
      }
    }
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Administración de Cursos</h1>
        <div className="flex space-x-4">
          <Link href="/api/admin/courses/export" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Descargar CSV
          </Link>
          <Link href="/admin/courses/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Añadir Nuevo Curso
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
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Título</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Profesor</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Precio</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200"></th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course: any) => (
                  <tr key={course.id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{course.titulo}</p></td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{`${course.profesor.nombres} ${course.profesor.apellido_paterno}`}</p></td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">${course.precio}</p></td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${course.activo ? 'text-green-900' : 'text-red-900'}`}>
                        <span aria-hidden className={`absolute inset-0 ${course.activo ? 'bg-green-200' : 'bg-red-200'} opacity-50 rounded-full`}></span>
                        <span className="relative">{course.activo ? 'Activo' : 'Inactivo'}</span>
                      </span>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                      <Link href={`/admin/courses/edit/${course.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</Link>
                      <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
              <span className="text-xs xs:text-sm text-gray-900">
                Mostrando {courses.length} de {totalItems} Cursos
              </span>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

