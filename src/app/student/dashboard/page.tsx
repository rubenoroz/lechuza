'use client';

import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('Hubo un problema al cargar tus cursos.');
  }
  return res.json();
});

export default function StudentDashboardPage() {
  const { data: courses, error, isLoading } = useSWR<any[]>(`/api/student/courses`, fetcher);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Cursos</h1>
        <div className="text-center p-10">Cargando tus cursos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Cursos</h1>
        <div className="text-center p-10 text-red-500">{error.message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Cursos</h1>
      
      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
              <Link href={`/courses/view/${course.id}`}>
                <div className="relative h-48 w-full">
                  <Image
                    src={course.imagen_portada || '/images/placeholder-image.jpg'}
                    alt={`Portada de ${course.titulo}`}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{course.titulo}</h2>
                  <p className="text-gray-600 text-sm line-clamp-3">{course.descripcion_corta}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-10 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Aún no estás inscrito en ningún curso.</h2>
          <p className="text-gray-500 mt-2">Explora nuestro catálogo y encuentra tu próxima aventura de aprendizaje.</p>
          <Link href="/courses" className="mt-6 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Ver Cursos
          </Link>
        </div>
      )}
    </div>
  );
}

