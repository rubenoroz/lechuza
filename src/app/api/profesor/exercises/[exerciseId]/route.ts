import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET - Obtener un ejercicio específico por ID
export async function GET(
  request: Request,
  { params }: { params: { exerciseId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || (!session.user.isProfesor && !session.user.isSuperAdmin)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const { exerciseId } = resolvedParams;

    const exercise = await prisma.exercise.findUnique({
      where: {
        id: exerciseId,
      },
    });

    if (!exercise) {
      return new NextResponse('Exercise not found', { status: 404 });
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error('[PROFESOR_EXERCISE_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}


// PUT - Actualizar un ejercicio
export async function PUT(
  request: Request,
  { params }: { params: { exerciseId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || (!session.user.isProfesor && !session.user.isSuperAdmin)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { instrucciones } = body;
    const resolvedParams = await params;
    const { exerciseId } = resolvedParams;

    if (!instrucciones) {
      return new NextResponse('Instructions are required', { status: 400 });
    }

    const updatedExercise = await prisma.exercise.update({
      where: {
        id: exerciseId,
      },
      data: {
        instrucciones,
      },
    });

    return NextResponse.json(updatedExercise);
  } catch (error) {
    console.error('[PROFESOR_EXERCISE_PUT]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// DELETE - Eliminar un ejercicio
export async function DELETE(
  request: Request,
  { params }: { params: { exerciseId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || (!session.user.isProfesor && !session.user.isSuperAdmin)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const { exerciseId } = resolvedParams;

    const classUsingExercise = await prisma.class.findFirst({
        where: { exerciseId: exerciseId }
    });

    if (classUsingExercise) {
        return new NextResponse('Cannot delete exercise. It is currently used in at least one class.', { status: 400 });
    }

    await prisma.exercise.delete({
      where: {
        id: exerciseId,
      },
    });

    return new NextResponse('Exercise deleted', { status: 200 });
  } catch (error) {
    console.error('[PROFESOR_EXERCISE_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}