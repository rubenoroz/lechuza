import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function getTeachers() {
  const teachers = await prisma.user.findMany({
    where: { isProfesor: true },
  });
  return teachers;
}

export default async function TeachersPage() {
  const teachers = await getTeachers();

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Nuestros Profesores</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Conoce a nuestro equipo
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="flex flex-col items-center text-center">
                <img className="w-32 h-32 rounded-full object-cover" src={teacher.foto_perfil || 'https://via.placeholder.com/150'} alt={teacher.nombre_completo || 'teacher'} />
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{teacher.nombre_completo}</h3>
                <p className="mt-2 text-base text-gray-500">{teacher.biografia}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
