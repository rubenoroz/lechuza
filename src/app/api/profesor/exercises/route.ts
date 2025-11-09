import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Obtener todos los ejercicios
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (!session.user.isProfesor && !session.user.isSuperAdmin)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(exercises);
  } catch (error) {
    console.error('[PROFESOR_EXERCISES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// POST - Crear un nuevo ejercicio
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (!session.user.isProfesor && !session.user.isSuperAdmin)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { instrucciones } = body;

    if (!instrucciones) {
      return new NextResponse('Instructions are required', { status: 400 });
    }

    const newExercise = await prisma.exercise.create({
      data: {
        instrucciones,
      },
    });

    return NextResponse.json(newExercise);
  } catch (error) {
    console.error('[PROFESOR_EXERCISES_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}