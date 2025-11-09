import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Obtener el contenido de un quiz para un estudiante
export async function GET(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { quizId } = await params;
    const userId = session.user.id;

    // 1. Verificar que el quiz existe y está asociado a una clase
    const classWithQuiz = await prisma.class.findFirst({
      where: { quizId: quizId },
      include: { module: true }
    });

    if (!classWithQuiz) {
      return new NextResponse('Quiz not found or not associated with any class', { status: 404 });
    }

    // 2. Verificar si el usuario está inscrito en el curso al que pertenece el quiz
    const courseId = classWithQuiz.module.courseId;
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId,
        },
      },
    });

    // Permitir también si es profesor o superadmin para facilitar pruebas
    const isPrivilegedUser = session.user.isProfesor || session.user.isSuperAdmin;

    if (!enrollment && !isPrivilegedUser) {
      return new NextResponse('Forbidden: You are not enrolled in the course for this quiz.', { status: 403 });
    }

    // 3. Si está autorizado, obtener el quiz, pero sin las respuestas correctas
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        preguntas: {
          orderBy: { order: 'asc' },
          include: {
            opciones: {
              select: {
                id: true,
                texto: true,
                // OMITIMOS intencionadamente 'es_correcta'
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      return new NextResponse('Quiz not found', { status: 404 });
    }

    return NextResponse.json(quiz);

  } catch (error) {
    console.error('[STUDENT_QUIZ_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
