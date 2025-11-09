import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Obtener un quiz específico por ID
export async function GET(
  request: Request,
  { params }: { params: { quizId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || (!session.user.isProfesor && !session.user.isSuperAdmin)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const { quizId } = resolvedParams;

    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
      },
      include: {
        preguntas: {
          orderBy: {
            order: 'asc'
          },
          include: {
            opciones: true
          }
        }
      }
    });

    if (!quiz) {
      return new NextResponse('Quiz not found', { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('[PROFESOR_QUIZ_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}


// PUT - Actualizar un quiz
export async function PUT(
  request: Request,
  { params }: { params: { quizId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || (!session.user.isProfesor && !session.user.isSuperAdmin)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { titulo } = body;
    const resolvedParams = await params;
    const { quizId } = resolvedParams;

    if (!titulo) {
      return new NextResponse('Title is required', { status: 400 });
    }

    const updatedQuiz = await prisma.quiz.update({
      where: {
        id: quizId,
      },
      data: {
        titulo,
      },
    });

    return NextResponse.json(updatedQuiz);
  } catch (error) {
    console.error('[PROFESOR_QUIZZES_PUT]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// DELETE - Eliminar un quiz
export async function DELETE(
  request: Request,
  { params }: { params: { quizId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || (!session.user.isProfesor && !session.user.isSuperAdmin)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const { quizId } = resolvedParams;

    // Opcional: verificar si el quiz está siendo usado en alguna clase
    const classUsingQuiz = await prisma.class.findFirst({
        where: { quizId: quizId }
    });

    if (classUsingQuiz) {
        return new NextResponse('Cannot delete quiz. It is currently used in at least one class.', { status: 400 });
    }

    await prisma.quiz.delete({
      where: {
        id: quizId,
      },
    });

    return new NextResponse('Quiz deleted', { status: 200 });
  } catch (error) {
    console.error('[PROFESOR_QUIZZES_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}