import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PUT - Actualizar una pregunta
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ quizId: string; questionId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || (!session.user.isProfesor && !session.user.isSuperAdmin)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { texto } = body;
    const { questionId } = await params;

    if (!texto) {
      return new NextResponse('Question text is required', { status: 400 });
    }

    const updatedQuestion = await prisma.question.update({
      where: {
        id: questionId,
      },
      data: {
        texto,
      },
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('[PROFESOR_QUESTION_PUT]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// DELETE - Eliminar una pregunta
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ quizId: string; questionId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || (!session.user.isProfesor && !session.user.isSuperAdmin)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { questionId } = await params;

    await prisma.question.delete({
      where: {
        id: questionId,
      },
    });

    return new NextResponse('Question deleted', { status: 200 });
  } catch (error) {
    console.error('[PROFESOR_QUESTION_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
