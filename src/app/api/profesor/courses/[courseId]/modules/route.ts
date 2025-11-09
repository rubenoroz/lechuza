import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const resolvedParams = await params;
    const { courseId } = resolvedParams;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { profesorId: true }
    });

    if (!course) {
      return new NextResponse('Course not found', { status: 404 });
    }

    console.log('session.user.id:', session.user.id);
    console.log('course.profesorId:', course.profesorId);
    // Solo el profesor del curso o un Super Admin puede ver los módulos
    if (course.profesorId !== session.user.id && !session.user.isSuperAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const modules = await prisma.module.findMany({
      where: { courseId: courseId },
      orderBy: { order: 'asc' },
      include: {
        clases: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return NextResponse.json(modules);
  } catch (error) {
    console.error('[PROFESOR_MODULES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { titulo } = body;

    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!titulo) {
      return new NextResponse('Title is required', { status: 400 });
    }

    const resolvedParams = await params;
    const { courseId } = resolvedParams;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { profesorId: true, activo: true }
    });

    if (!course) {
      return new NextResponse('Course not found', { status: 404 });
    }

    // Solo el profesor del curso o un Super Admin puede crear módulos
    if (String(course.profesorId) !== String(session.user.id) && !session.user.isSuperAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Si el curso está activo y el usuario no es Super Admin, crear un borrador
    if (course.activo && !session.user.isSuperAdmin) {
      // Lógica para crear un CourseDraft si el curso está activo
      // Esto es más complejo y requeriría un endpoint separado o lógica de borrador más robusta.
      // Por ahora, simplemente no permitiremos la edición directa de cursos activos por profesores.
      return new NextResponse('Cannot add modules to an active course directly. Please create a draft.', { status: 403 });
    }

    const lastModule = await prisma.module.findFirst({
      where: { courseId: courseId },
      orderBy: { order: 'desc' },
    });

    const newOrder = lastModule ? lastModule.order + 1 : 1;

    const module = await prisma.module.create({
      data: {
        titulo,
        courseId,
        order: newOrder,
      },
    });

    return NextResponse.json(module);
  } catch (error) {
    console.error('[PROFESOR_MODULES_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}


