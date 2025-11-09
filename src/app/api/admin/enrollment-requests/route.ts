import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Obtener todas las solicitudes de inscripción
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (!session.user.isEnrollmentAdmin && !session.user.isSuperAdmin)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Para filtrar por estado

    const whereClause: any = {};
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      whereClause.status = status;
    }

    const enrollmentRequests = await prisma.enrollmentRequest.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            nombres: true,
            apellido_paterno: true,
            email: true,
          },
        },
        course: {
          select: {
            titulo: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(enrollmentRequests);
  } catch (error) {
    console.error('[ENROLLMENT_REQUESTS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
