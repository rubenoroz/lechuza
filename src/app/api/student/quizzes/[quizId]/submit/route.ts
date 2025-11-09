import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface Answers {
  [questionId: string]: string[]; // { questionId: [optionId1, optionId2] }
}

// POST - Enviar las respuestas de un quiz y obtener el resultado
export async function POST(
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
    const body = await request.json();
    const studentAnswers: Answers = body.answers;

    // 1. Verificar autorización (similar a la ruta GET)
    const classWithQuiz = await prisma.class.findFirst({
      where: { quizId: quizId },
      include: { module: true }
    });

    if (!classWithQuiz) {
      return new NextResponse('Quiz not found or not associated with any class', { status: 404 });
    }

    const courseId = classWithQuiz.module.courseId;
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: userId, courseId: courseId } },
    });
    
    const isPrivilegedUser = session.user.isProfesor || session.user.isSuperAdmin;

    if (!enrollment && !isPrivilegedUser) {
      return new NextResponse('Forbidden: You are not enrolled in the course for this quiz.', { status: 403 });
    }

    // 2. Obtener las preguntas con las respuestas correctas desde la BD
    const questionsFromDb = await prisma.question.findMany({
      where: { quizId: quizId },
      include: {
        opciones: {
          where: { es_correcta: true },
        },
      },
    });

    // 3. Calcular el puntaje (lógica estricta para respuestas múltiples)
    let score = 0;
    const results: { [questionId: string]: { correctOptionIds: string[], studentOptionIds: string[], isCorrect: boolean } } = {};

    for (const question of questionsFromDb) {
      const correctOptionIds = new Set(question.opciones.map(opt => opt.id));
      const studentOptionIds = new Set(studentAnswers[question.id] || []);

      const isCorrect = correctOptionIds.size === studentOptionIds.size &&
                        [...correctOptionIds].every(id => studentOptionIds.has(id));

      if (isCorrect) {
        score++;
      }
      
      results[question.id] = {
        correctOptionIds: Array.from(correctOptionIds),
        studentOptionIds: Array.from(studentOptionIds),
        isCorrect: isCorrect,
      };
    }

    const totalQuestions = questionsFromDb.length;
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

    // (Opcional) Aquí podrías guardar el resultado en la base de datos para el progreso del alumno

    return NextResponse.json({
      score,
      totalQuestions,
      percentage,
      results,
    });

  } catch (error) {
    console.error('[STUDENT_QUIZ_SUBMIT]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
