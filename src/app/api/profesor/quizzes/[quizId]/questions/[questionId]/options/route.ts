import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST - Crear una nueva opción para una pregunta
export async function POST(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || (!session.user.isProfesor && !session.user.isSuperAdmin)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { texto, es_correcta } = body;
    const { questionId } = await params;

    if (texto === undefined || es_correcta === undefined) {
      return new NextResponse('Option text and correctness status are required', { status: 400 });
    }

    const newOption = await prisma.option.create({
      data: {
        texto,
        es_correcta,
        questionId,
      },
    });

    return NextResponse.json(newOption);
  } catch (error) {
    console.error('[PROFESOR_OPTION_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
