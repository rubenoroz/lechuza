import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET - Obtener los cursos en los que el estudiante está inscrito
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        course: true, // Incluir toda la información del curso
      },
      orderBy: {
        course: {
          titulo: 'asc',
        },
      },
    });

    // Extraemos solo los cursos de las inscripciones
    const courses = enrollments.map(enrollment => enrollment.course);

    return NextResponse.json(courses);
  } catch (error) {
    console.error('[STUDENT_COURSES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
