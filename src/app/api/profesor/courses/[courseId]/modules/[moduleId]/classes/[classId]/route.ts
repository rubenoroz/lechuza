import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ courseId: string, moduleId: string, classId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { titulo, tipo_contenido, contenido_video, contenido_texto, quizId, exerciseId, videoFilePath, videoMimeType, videoFileSize } = body;

    if (!titulo || !tipo_contenido) {
      return NextResponse.json({ message: 'Title and content type are required' }, { status: 400 });
    }

    if (tipo_contenido === 'Video' && !contenido_video && !videoFilePath) {
      return NextResponse.json({ message: 'For video content, either a video URL or a video file path is required' }, { status: 400 });
    }

    const { courseId, moduleId, classId } = await params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { profesorId: true, activo: true }
    });

    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    if (course.profesorId !== session.user.id && !session.user.isSuperAdmin) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Si el curso está activo y el usuario no es Super Admin, crear un borrador
    if (course.activo && !session.user.isSuperAdmin) {
      return NextResponse.json({ message: 'Cannot update classes of an active course directly. Please create a draft.' }, { status: 403 });
    }

    const updatedClass = await prisma.class.update({
      where: { id: classId, moduleId: moduleId },
      data: {
        titulo,
        tipo_contenido,
        contenido_video,
        contenido_texto,
        quizId,
        exerciseId,
        videoFilePath,
        videoMimeType,
        videoFileSize,
      },
    });

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('[PROFESOR_CLASSES_PUT]', error);
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ courseId: string, moduleId: string, classId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, moduleId, classId } = await params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { profesorId: true, activo: true }
    });

    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    // Solo el profesor del curso o un Super Admin puede eliminar clases
    if (course.profesorId !== session.user.id && !session.user.isSuperAdmin) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Si el curso está activo y el usuario no es Super Admin, crear un borrador
    if (course.activo && !session.user.isSuperAdmin) {
      return NextResponse.json({ message: 'Cannot delete classes from an active course directly. Please create a draft.' }, { status: 403 });
    }

    await prisma.class.delete({
      where: { id: classId, moduleId: moduleId },
    });

    return new NextResponse('Class deleted', { status: 200 });
  } catch (error) {
    console.error('[PROFESOR_CLASSES_DELETE]', error);
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
  }
}
