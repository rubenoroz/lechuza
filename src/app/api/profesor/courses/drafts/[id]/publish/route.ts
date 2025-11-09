import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Helper to get ID from URL
const getIdFromUrl = (url: string) => {
  const parts = url.split('/');
  return parts[parts.length - 2]; // Get the ID before /publish
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // Only Super Admins can publish drafts
  if (!session || !session.user?.isSuperAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const draftId = getIdFromUrl(request.url);

    const draft = await prisma.courseDraft.findUnique({
      where: { id: draftId },
    });

    if (!draft) {
      return NextResponse.json({ message: 'Course Draft not found' }, { status: 404 });
    }

    // Update the original Course with data from the draft
    const updatedCourse = await prisma.course.update({
      where: { id: draft.courseId },
      data: {
        titulo: draft.titulo,
        slug: draft.slug,
        descripcion_corta: draft.descripcion_corta,
        descripcion_larga: draft.descripcion_larga,
        imagen_portada: draft.imagen_portada,
        video_presentacion: draft.video_presentacion,
        modalidad: draft.modalidad,
        nivel: draft.nivel,
        publico_objetivo: draft.publico_objetivo,
        precio: draft.precio,
        activo: true, // Always set to active when published
      },
    });

    // Delete the draft after publishing
    await prisma.courseDraft.delete({
      where: { id: draftId },
    });

    return NextResponse.json({ message: 'Course draft published successfully', course: updatedCourse }, { status: 200 });
  } catch (error) {
    console.error('[ADMIN_COURSE_DRAFT_PUBLISH]', error);
    return NextResponse.json({ message: 'Failed to publish course draft' }, { status: 500 });
  }
}
