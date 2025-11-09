import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST - Crear una nueva pregunta para un quiz
export async function POST(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || (!session.user.isProfesor && !session.user.isSuperAdmin)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { texto } = body;
    const { quizId } = await params;

    if (!texto) {
      return new NextResponse('Question text is required', { status: 400 });
    }

    const lastQuestion = await prisma.question.findFirst({
        where: { quizId: quizId },
        orderBy: { order: 'desc' },
    });

    const newOrder = lastQuestion ? lastQuestion.order + 1 : 1;

    const newQuestion = await prisma.question.create({
      data: {
        texto,
        quizId,
        order: newOrder,
      },
    });

    return NextResponse.json(newQuestion);
  } catch (error) {
    console.error('[PROFESOR_QUESTIONS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
