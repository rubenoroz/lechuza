import { PrismaClient } from '@/generated/prisma';
import Link from 'next/link';
import Image from 'next/image'; // Importar el componente Image

const prisma = new PrismaClient();

async function getCourses() {
  const courses = await prisma.course.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
  return courses;
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Catálogo</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Todos nuestros cursos
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div key={course.id} className="flex flex-col rounded-lg shadow-lg overflow-hidden">
                <div className="flex-shrink-0">
                  <Image
                    className="h-64 w-full object-contain"
                    src={course.imagen_portada || '/images/placeholder-course.jpg'}
                    alt={course.titulo}
                    width={300} // Ancho de placeholder
                    height={256} // Altura de placeholder (h-64 = 256px)
                  />
                </div>
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-600">
                      {course.modalidad}
                    </p>
                    <Link href={`/courses/${course.slug}`} className="block mt-2">
                      <p className="text-xl font-semibold text-gray-900">{course.titulo}</p>
                      <p className="mt-3 text-base text-gray-500">{course.descripcion_corta}</p>
                    </Link>
                    <p className="mt-3 text-lg font-bold text-gray-900">${course.precio}</p>
                  </div>
                  <div className="mt-6">
                    <Link
                      href={`/courses/${course.slug}`}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Ver curso
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
