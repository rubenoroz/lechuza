import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PUT - Actualizar una opción
export async function PUT(
  request: Request,
  { params }: { params: { optionId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || (!session.user.isProfesor && !session.user.isSuperAdmin)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { texto, es_correcta } = body;
    const resolvedParams = await params;
    const { optionId } = resolvedParams;

    if (texto === undefined && es_correcta === undefined) {
      return new NextResponse('Either text or correctness status is required for update', { status: 400 });
    }

    const updatedOption = await prisma.option.update({
      where: {
        id: optionId,
      },
      data: {
        texto,
        es_correcta,
      },
    });

    return NextResponse.json(updatedOption);
  } catch (error) {
    console.error('[PROFESOR_OPTION_PUT]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// DELETE - Eliminar una opción
export async function DELETE(
  request: Request,
  { params }: { params: { optionId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || (!session.user.isProfesor && !session.user.isSuperAdmin)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const { optionId } = resolvedParams;

    await prisma.option.delete({
      where: {
        id: optionId,
      },
    });

    return new NextResponse('Option deleted', { status: 200 });
  } catch (error) {
    console.error('[PROFESOR_OPTION_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
