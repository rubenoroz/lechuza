import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';

export default async function ProfesorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.isProfesor) {
    redirect('/login');
  }

  return (
    <div className="flex bg-gray-100">
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4 text-2xl font-bold">Panel de Profesor</div>
        <nav className="mt-10">
          <Link href="/profesor/dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Dashboard</Link>
          <Link href="/profesor/courses" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Mis Cursos</Link>
          <Link href="/profesor/quizzes" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Quizzes</Link>
          <Link href="/profesor/exercises" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Ejercicios</Link>
        </nav>
      </div>
      <div className="flex-1 p-10 text-gray-900">
        {children}
      </div>
    </div>
  );
}
