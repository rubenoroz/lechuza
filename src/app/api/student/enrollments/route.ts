import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET - Verificar el estado de inscripción de un estudiante para un curso específico
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');

  if (!courseId) {
    return new NextResponse('Course ID is required', { status: 400 });
  }

  try {
    const userId = session.user.id;

    // 1. Verificar si ya está inscrito
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (enrollment) {
      return NextResponse.json({ status: 'ENROLLED' });
    }

    // 2. Verificar si tiene una solicitud pendiente o rechazada
    const enrollmentRequest = await prisma.enrollmentRequest.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (enrollmentRequest) {
      return NextResponse.json({ status: enrollmentRequest.status }); // PENDING or REJECTED
    }

    // 3. Si no hay nada, está disponible para inscribirse
    return NextResponse.json({ status: 'NOT_ENROLLED' });

  } catch (error) {
    console.error('[ENROLLMENT_STATUS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


// POST - Crear una nueva solicitud de inscripción
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return new NextResponse('Course ID is required', { status: 400 });
    }

    const userId = session.user.id;

    // Verificar que no exista ya una solicitud o inscripción
    const existingRequest = await prisma.enrollmentRequest.findUnique({
        where: { userId_courseId: { userId, courseId } },
    });
    const existingEnrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
    });

    if (existingEnrollment) {
        return new NextResponse('User is already enrolled in this course', { status: 409 });
    }
    if (existingRequest) {
        return new NextResponse('An enrollment request already exists for this course', { status: 409 });
    }

    const newRequest = await prisma.enrollmentRequest.create({
      data: {
        userId,
        courseId,
        status: 'PENDING',
      },
    });

    // Aquí se podría disparar el envío de un email con las instrucciones de pago

    return NextResponse.json(newRequest);
  } catch (error) {
    console.error('[ENROLLMENT_REQUEST_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
