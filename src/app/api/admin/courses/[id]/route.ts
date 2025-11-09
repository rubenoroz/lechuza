import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Helper to get ID from URL
const getIdFromUrl = (url: string) => {
  const parts = url.split('/');
  return parts[parts.length - 1];
};

// Helper to check course ownership
async function checkCourseOwnership(courseId: string, userId: string): Promise<boolean> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { profesorId: true },
  });
  return course?.profesorId === userId;
}

// GET a single course by ID
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (!session.user?.isSuperAdmin && !session.user?.isProfesor)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = getIdFromUrl(request.url);

    // If user is an instructor but not a super admin, check ownership
    if (session.user?.isProfesor && !session.user?.isSuperAdmin) {
      const isOwner = await checkCourseOwnership(id, session.user.id);
      if (!isOwner) {
        return NextResponse.json({ message: 'Unauthorized: You do not own this course.' }, { status: 403 });
      }
    }

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }
    return NextResponse.json(course, { status: 200 });
  } catch (error) {
    console.error('[ADMIN_COURSE_ID_GET]', error);
    return NextResponse.json({ message: 'Failed to fetch course' }, { status: 500 });
  }
}

// UPDATE a course by ID
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (!session.user?.isSuperAdmin && !session.user?.isProfesor)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = getIdFromUrl(request.url);
    let body = await request.json();

    const currentCourse = await prisma.course.findUnique({
      where: { id },
      select: { activo: true, profesorId: true, titulo: true }, // Select necessary fields
    });

    if (!currentCourse) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    // Check ownership for instructors
    if (session.user?.isProfesor && !session.user?.isSuperAdmin) {
      if (currentCourse.profesorId !== session.user.id) {
        return NextResponse.json({ message: 'Unauthorized: You do not own this course.' }, { status: 403 });
      }
      // Profesores no pueden cambiar el estado 'activo' directamente
      if (body.activo !== undefined) {
        delete body.activo;
      }

      // If the course is currently active (published), save changes as a draft
      if (currentCourse.activo) {
        // Prepare data for CourseDraft, excluding fields not in CourseDraft or handled differently
        const draftData = {
          courseId: id,
          profesorId: session.user.id,
          titulo: body.titulo || currentCourse.titulo, // Use body value or current if not provided
          slug: body.slug,
          descripcion_corta: body.descripcion_corta,
          descripcion_larga: body.descripcion_larga,
          imagen_portada: body.imagen_portada,
          video_presentacion: body.video_presentacion,
          modalidad: body.modalidad,
          nivel: body.nivel,
          publico_objetivo: body.publico_objetivo,
          precio: body.precio,
          isPendingReview: true,
        };

        const existingDraft = await prisma.courseDraft.findUnique({
          where: { courseId: id },
        });

        if (existingDraft) {
          await prisma.courseDraft.update({
            where: { courseId: id },
            data: draftData,
          });
        } else {
          await prisma.courseDraft.create({
            data: draftData,
          });
        }
        return NextResponse.json({ message: 'Changes saved as draft for review.' }, { status: 200 });
      } else {
        // Si el curso no está activo (ya es un borrador del profesor), actualízalo directamente
        const updatedCourse = await prisma.course.update({
          where: { id },
          data: body,
        });
        return NextResponse.json(updatedCourse, { status: 200 });
      }
    } else if (session.user?.isSuperAdmin) {
      // Super Admin can update the course directly
      const updatedCourse = await prisma.course.update({
        where: { id },
        data: body,
      });

      // If a draft exists for this course, delete it as Super Admin's changes take precedence
      await prisma.courseDraft.deleteMany({
        where: { courseId: id },
      });

      return NextResponse.json(updatedCourse, { status: 200 });
    }

    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    console.error('[ADMIN_COURSE_ID_PUT]', error);
    return NextResponse.json({ message: 'Failed to update course' }, { status: 500 });
  }
}

// DELETE a course by ID
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  // Only Super Admins can delete courses
  if (!session || !session.user?.isSuperAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = getIdFromUrl(request.url);

    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Course deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('[ADMIN_COURSE_ID_DELETE]', error);
    return NextResponse.json({ message: 'Failed to delete course' }, { status: 500 });
  }
}