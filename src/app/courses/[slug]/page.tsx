import { PrismaClient } from '@/generated/prisma';
import Image from 'next/image'; // Importar el componente Image

const prisma = new PrismaClient();

async function getCourse(slug: string) {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modulos: {
        include: {
          clases: true,
        },
      },
    },
  });
  return course;
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    return <div>Curso no encontrado</div>;
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">{course.modalidad}</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {course.titulo}
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            {course.descripcion_corta}
          </p>
        </div>

        <div className="mt-10">
          <Image className="w-full h-auto object-contain rounded-lg shadow-lg" src={course.imagen_portada} alt={course.titulo} width={800} height={400} />
        </div>

        <div className="mt-10 prose prose-lg text-gray-500 mx-auto">
          <div dangerouslySetInnerHTML={{ __html: course.descripcion_larga }} />
        </div>

        <div className="mt-10">
          <h3 className="text-2xl font-extrabold text-gray-900 mb-4">Módulos del curso</h3>
          <div className="space-y-8">
            {course.modulos.map((module) => (
              <div key={module.id} className="bg-gray-50 rounded-lg shadow p-6">
                <h4 className="text-xl font-bold text-gray-900">{module.titulo}</h4>
                <ul className="mt-4 space-y-2">
                  {module.clases.map((clase) => (
                    <li key={clase.id} className="flex items-center">
                      <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{clase.titulo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
