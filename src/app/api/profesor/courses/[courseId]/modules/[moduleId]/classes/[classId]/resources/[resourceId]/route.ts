import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  context: { params: { courseId: string, moduleId: string, classId: string, resourceId: string } }
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

    const { courseId, classId, resourceId } = context.params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { profesorId: true, activo: true }
    });

    if (!course) {
      return new NextResponse('Course not found', { status: 404 });
    }

    // Solo el profesor del curso o un Super Admin puede actualizar recursos de clase
    if (course.profesorId !== session.user.id && !session.user.isSuperAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Si el curso está activo y el usuario no es Super Admin, crear un borrador
    if (course.activo && !session.user.isSuperAdmin) {
      return new NextResponse('Cannot update resources of an active course directly. Please create a draft.', { status: 403 });
    }

    const resource = await prisma.resource.update({
      where: { id: resourceId, classId: classId },
      data: { nombre, url, tipo, filePath, mimeType, fileSize },
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error('[PROFESOR_CLASS_RESOURCE_ID_PUT]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: { courseId: string, moduleId: string, classId: string, resourceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { courseId, classId, resourceId } = context.params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { profesorId: true, activo: true }
    });

    if (!course) {
      return new NextResponse('Course not found', { status: 404 });
    }

    // Solo el profesor del curso o un Super Admin puede eliminar recursos de clase
    if (course.profesorId !== session.user.id && !session.user.isSuperAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Si el curso está activo y el usuario no es Super Admin, crear un borrador
    if (course.activo && !session.user.isSuperAdmin) {
      return new NextResponse('Cannot delete resources from an active course directly. Please create a draft.', { status: 403 });
    }

    await prisma.resource.delete({
      where: { id: resourceId, classId: classId },
    });

    return new NextResponse('Resource deleted', { status: 200 });
  } catch (error) {
    console.error('[PROFESOR_CLASS_RESOURCE_ID_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
