'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Pagination from '@/components/Pagination';
import { useSession } from 'next-auth/react';

export default function ProfesorCoursesPage() {
  const { data: session } = useSession();
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
      // The API /api/admin/courses now filters by profesor
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
    if (session?.user?.isProfesor) { // Only fetch if the user is a profesor
      fetchCourses(currentPage);
    }
  }, [currentPage, fetchCourses, session]);

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este curso?')) {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchCourses(currentPage); // Refresh the current page after delete
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

  if (!session?.user?.isProfesor) {
    return <div className="text-center p-10 text-red-500">Acceso denegado. No eres un profesor.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mis Cursos</h1>
        <Link href="/profesor/courses/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Crear Nuevo Curso
        </Link>
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
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200"></th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course: any) => (
                  <tr key={course.id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{course.titulo}</p></td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{`${course.profesor.nombres} ${course.profesor.apellido_paterno}`}</p></td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">${course.precio}</p></td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                      <Link href={`/profesor/courses/edit/${course.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</Link>
                      {session?.user?.isSuperAdmin && (
                        <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                      )}
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
