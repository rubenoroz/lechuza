import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// import prisma from '@/lib/prisma';

// PUT - Aprobar o Rechazar una solicitud de inscripción
export async function PUT(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  // Cuerpo de la función comentado para depuración
  return NextResponse.json({ message: `Debug response for request ID: ${params.requestId}` });

  /*
  const session = await getServerSession(authOptions);

  if (!session || (!session.user.isEnrollmentAdmin && !session.user.isSuperAdmin)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { requestId } = params;
    const body = await request.json();
    const { status } = body; // 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return new NextResponse('Invalid status provided', { status: 400 });
    }

    const requestToUpdate = await prisma.enrollmentRequest.findUnique({
      where: { id: requestId },
    });

    if (!requestToUpdate) {
      return new NextResponse('Enrollment request not found', { status: 404 });
    }
    
    if (requestToUpdate.status !== 'PENDING') {
      return new NextResponse(`Request has already been ${requestToUpdate.status.toLowerCase()}`, { status: 409 });
    }

    if (status === 'APPROVED') {
      // Usar una transacción para asegurar la atomicidad
      await prisma.$transaction(async (tx) => {
        // 1. Crear la inscripción oficial
        await tx.enrollment.create({
          data: {
            userId: requestToUpdate.userId,
            courseId: requestToUpdate.courseId,
          },
        });

        // 2. Actualizar el estado de la solicitud
        await tx.enrollmentRequest.update({
          where: { id: requestId },
          data: { status: 'APPROVED' },
        });
      });
    } else { // status === 'REJECTED'
      await prisma.enrollmentRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' },
      });
    }

    return NextResponse.json({ message: `Request successfully ${status.toLowerCase()}` });

  } catch (error) {
    console.error('[ENROLLMENT_REQUEST_PUT]', error);
    // Manejar error de inscripción duplicada
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2002') {
        return new NextResponse('This user is already enrolled in the course.', { status: 409 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
  */
}
