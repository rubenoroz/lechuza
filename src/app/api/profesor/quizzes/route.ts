import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET - Obtener todos los quizzes
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (!session.user.isProfesor && !session.user.isSuperAdmin)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const quizzes = await prisma.quiz.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('[PROFESOR_QUIZZES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// POST - Crear un nuevo quiz
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (!session.user.isProfesor && !session.user.isSuperAdmin)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { titulo } = body;

    if (!titulo) {
      return new NextResponse('Title is required', { status: 400 });
    }

    const newQuiz = await prisma.quiz.create({
      data: {
        titulo,
      },
    });

    return NextResponse.json(newQuiz);
  } catch (error) {
    console.error('[PROFESOR_QUIZZES_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}