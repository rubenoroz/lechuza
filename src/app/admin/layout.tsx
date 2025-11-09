
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.isSuperAdmin) {
    redirect('/login');
  }

  return (
    <div className="flex bg-gray-100">
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4 text-2xl font-bold">Administrador</div>
        <nav className="mt-10">
          <Link href="/admin" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Dashboard</Link>
          <Link href="/admin/users" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Usuarios</Link>
          <Link href="/admin/courses" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Cursos</Link>
        </nav>
      </div>
      <div className="flex-1 p-10 text-gray-900">
        {children}
      </div>
    </div>
  );
}
