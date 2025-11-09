import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string, moduleId: string, classId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { courseId, moduleId, classId } = await params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { profesorId: true }
    });

    if (!course) {
      return new NextResponse('Course not found', { status: 404 });
    }

    // Solo el profesor del curso o un Super Admin puede ver los recursos de clase
    if (course.profesorId !== session.user.id && !session.user.isSuperAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const resources = await prisma.resource.findMany({
      where: { classId: classId },
      orderBy: { nombre: 'asc' }, // O por algún otro campo relevante
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error('[PROFESOR_CLASS_RESOURCES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string, moduleId: string, classId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { nombre, url, tipo, filePath, mimeType, fileSize } = body;

    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!nombre || !tipo || (!url && !filePath)) {
      return new NextResponse('Name, type, and either URL or filePath are required', { status: 400 });
    }

    const { courseId, classId } = await params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { profesorId: true, activo: true }
    });

    if (!course) {
      return new NextResponse('Course not found', { status: 404 });
    }

    // Solo el profesor del curso o un Super Admin puede crear recursos de clase
    if (course.profesorId !== session.user.id && !session.user.isSuperAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Si el curso está activo y el usuario no es Super Admin, crear un borrador
    if (course.activo && !session.user.isSuperAdmin) {
      return new NextResponse('Cannot add resources to an active course directly. Please create a draft.', { status: 403 });
    }

    const resource = await prisma.resource.create({
      data: {
        nombre,
        url,
        tipo,
        filePath,
        mimeType,
        fileSize,
        classId: classId,
      },
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error('[PROFESOR_CLASS_RESOURCES_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
