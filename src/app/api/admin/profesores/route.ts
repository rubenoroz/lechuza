import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.isSuperAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const instructors = await prisma.user.findMany({
      where: {
        isProfesor: true,
      },
      select: {
        id: true,
        nombres: true,
        apellido_paterno: true,
        apellido_materno: true,
        email: true,
      },
      orderBy: {
        nombres: 'asc',
      },
    });

    return NextResponse.json(instructors, { status: 200 });
  } catch (error) {
    console.error('Error fetching profesores:', error);
    return NextResponse.json({ message: 'Failed to fetch profesores' }, { status: 500 });
  }
}
