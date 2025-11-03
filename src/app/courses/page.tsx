import { PrismaClient } from '@/generated/prisma';
import Link from 'next/link';

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
                  <img className="h-48 w-full object-cover" src={course.imagen_portada || 'https://via.placeholder.com/300'} alt={course.titulo} />
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
                  </div>
                  <div className="mt-6 flex items-center">
                    <div className="flex-shrink-0">
                      {/* <img className="h-10 w-10 rounded-full" src={course.instructor.foto_perfil} alt={course.instructor.nombre_completo} /> */}
                    </div>
                    <div className="ml-3">
                      {/* <p className="text-sm font-medium text-gray-900">{course.instructor.nombre_completo}</p> */}
                    </div>
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
