import { PrismaClient } from '@/generated/prisma';
import Link from 'next/link';

const prisma = new PrismaClient();

async function getCourses() {
  const courses = await prisma.course.findMany({
    take: 6,
    orderBy: {
      createdAt: 'desc',
    },
  });
  return courses;
}

export default async function Home() {
  const courses = await getCourses();

  return (
    <div className="bg-white">
      <div className="relative bg-gray-900">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
            alt=""
          />
          <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
        </div>
        <div className="relative container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            Bienvenido a Lechuza
          </h1>
          <p className="mt-3 max-w-md mx-auto text-lg text-gray-300 sm:text-xl md:mt-5 md:max-w-3xl">
            Tu plataforma de aprendizaje en línea. Cursos para todas las edades y niveles.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                href="/courses"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Explorar cursos
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Cursos Recientes</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Nuestros cursos más nuevos
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
    </div>
  );
}