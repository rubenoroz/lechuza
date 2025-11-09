import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  // Only Super Admins or Enrollment Admins can export user data
  if (!session || (!session.user?.isSuperAdmin && !session.user?.isEnrollmentAdmin)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        numero_matricula: true,
        apellido_paterno: true,
        apellido_materno: true,
        nombres: true,
        telefono: true,
        email: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // CSV Headers
    const headers = [
      'Numero de Matricula',
      'Apellido Paterno',
      'Apellido Materno',
      'Nombres',
      'Telefono',
      'Email',
    ];

    // Map user data to CSV rows
    const csvRows = users.map((user) => {
      return [
        user.numero_matricula || '',
        user.apellido_paterno,
        user.apellido_materno || '',
        user.nombres,
        user.telefono || '',
        user.email,
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','); // Escape double quotes and join
    });

    // Combine headers and rows
    const csv = [headers.join(','), ...csvRows].join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="usuarios.csv"',
      },
    });
  } catch (error) {
    console.error('Error exporting users to CSV:', error);
    return NextResponse.json({ message: 'Failed to export users to CSV' }, { status: 500 });
  }
}
