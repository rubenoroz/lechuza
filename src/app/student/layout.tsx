import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.isStudent) {
    redirect('/login');
  }

  return (
    <div className="flex bg-gray-100">
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4 text-2xl font-bold">Panel de Estudiante</div>
        <nav className="mt-10">
          <Link href="/student/dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Dashboard</Link>
          <Link href="/student/dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Mis Cursos</Link>
          {/* Add more links for student functionalities */}
        </nav>
      </div>
      <div className="flex-1 p-10">
        {children}
      </div>
    </div>
  );
}
