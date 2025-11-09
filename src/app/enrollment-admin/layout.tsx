import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';

export default async function EnrollmentAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (!session.user?.isEnrollmentAdmin && !session.user?.isSuperAdmin)) {
    redirect('/login');
  }

  return (
    <div className="flex bg-gray-100">
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4 text-2xl font-bold">Control Escolar</div>
        <nav className="mt-10">
          <Link href="/enrollment-admin/dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Dashboard</Link>
          <Link href="/enrollment-admin/students" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Gestión de Alumnos</Link>
          {/* Add more links for enrollment admin functionalities */}
        </nav>
      </div>
      <div className="flex-1 p-10">
        {children}
      </div>
    </div>
  );
}
