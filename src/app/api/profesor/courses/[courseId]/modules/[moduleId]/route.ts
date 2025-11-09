import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { courseId: string, moduleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { titulo } = body; // Solo permitimos actualizar el título por ahora

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!titulo) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    const resolvedParams = await params;
    const { courseId, moduleId } = resolvedParams;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { profesorId: true, activo: true }
    });

    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    // Solo el profesor del curso o un Super Admin puede actualizar módulos
    if (course.profesorId !== session.user.id && !session.user.isSuperAdmin) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Si el curso está activo y el usuario no es Super Admin, crear un borrador
    if (course.activo && !session.user.isSuperAdmin) {
      return NextResponse.json({ message: 'Cannot update modules of an active course directly. Please create a draft.' }, { status: 403 });
    }

    const module = await prisma.module.update({
      where: { id: moduleId, courseId: courseId },
      data: { titulo },
    });

    return NextResponse.json(module);
  } catch (error) {
    console.error('[PROFESOR_MODULE_ID_PUT]', error);
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string, moduleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { courseId, moduleId } = resolvedParams;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { profesorId: true, activo: true }
    });

    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    // Solo el profesor del curso o un Super Admin puede eliminar módulos
    if (course.profesorId !== session.user.id && !session.user.isSuperAdmin) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Si el curso está activo y el usuario no es Super Admin, crear un borrador
    if (course.activo && !session.user.isSuperAdmin) {
      return NextResponse.json({ message: 'Cannot delete modules from an active course directly. Please create a draft.' }, { status: 403 });
    }

    await prisma.module.delete({
      where: { id: moduleId, courseId: courseId },
    });

    return new NextResponse('Module deleted', { status: 200 });
  } catch (error) {
    console.error('[PROFESOR_MODULE_ID_DELETE]', error);
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
  }
}
