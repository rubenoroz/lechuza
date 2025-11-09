import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Obtener el contenido completo de un curso para un usuario autorizado
export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { courseId } = await params;
    const userId = session.user.id;

    // 1. Verificar si el usuario es profesor del curso o un superadmin
    const courseOwner = await prisma.course.findFirst({
      where: {
        id: courseId,
        OR: [
          { profesorId: userId },
          { profesor: { isSuperAdmin: true } } // Asumiendo que el superadmin está en el modelo User
        ]
      }
    });

    // 2. Si no es propietario/admin, verificar si está inscrito
    let isEnrolled = false;
    if (!courseOwner) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: userId,
            courseId: courseId,
          },
        },
      });
      if (enrollment) {
        isEnrolled = true;
      }
    }

    // 3. Si no es propietario/admin Y no está inscrito, denegar acceso
    if (!courseOwner && !isEnrolled) {
      return new NextResponse('Forbidden: You are not enrolled in this course.', { status: 403 });
    }

    // 4. Si está autorizado, obtener el contenido completo del curso
    const courseContent = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modulos: {
          orderBy: { order: 'asc' },
          include: {
            clases: {
              orderBy: { order: 'asc' },
              include: {
                recursos_clase: true,
                quiz: true,
                exercise: true,
              },
            },
          },
        },
        recursos_generales: true,
      },
    });

    if (!courseContent) {
      return new NextResponse('Course not found', { status: 404 });
    }

    return NextResponse.json(courseContent);

  } catch (error) {
    console.error('[COURSE_CONTENT_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
