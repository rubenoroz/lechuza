import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { User as NextAuthUser } from 'next-auth'; // Importar el tipo User de next-auth

// Extender el tipo User para usarlo localmente
interface ExtendedUser extends NextAuthUser {
  id: string;
  isSuperAdmin?: boolean;
  isEnrollmentAdmin?: boolean;
  isProfesor?: boolean;
  isStudent?: boolean;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // Forzar el tipo de session.user a ExtendedUser
  const user = session?.user as ExtendedUser;

  if (!session || (!user?.isSuperAdmin && !user?.isProfesor)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const {
      titulo,
      slug,
      descripcion_corta,
      descripcion_larga,
      imagen_portada,
      video_presentacion,
      modalidad,
      nivel,
      publico_objetivo,
      precio,
      profesorId,
      activo, // Add activo to destructured body
    } = await request.json();

    // If user is an instructor but not a super admin, they can only create courses for themselves
    if (session.user?.isProfesor && !session.user?.isSuperAdmin && profesorId !== session.user.id) {
      return NextResponse.json({ message: 'Unauthorized: Profesores solo pueden crear cursos para ellos mismos.' }, { status: 403 });
    }

    // Determine 'activo' status based on user role
    let courseActivo = activo;
    if (session.user?.isProfesor && !session.user?.isSuperAdmin) {
      courseActivo = false; // Profesores crean cursos como inactivos (borrador)
    } else if (session.user?.isSuperAdmin && activo === undefined) {
      courseActivo = true; // Super admin defaults to active if not specified
    }

    const course = await prisma.course.create({
      data: {
        titulo,
        slug,
        descripcion_corta,
        descripcion_larga,
        imagen_portada,
        video_presentacion,
        modalidad,
        nivel,
        publico_objetivo,
        precio,
        activo: courseActivo, // Use determined activo status
        profesor: {
          connect: { id: profesorId },
        },
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('[ADMIN_COURSES_POST]', error);
    return NextResponse.json({ message: 'Failed to create course' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  // Forzar el tipo de session.user a ExtendedUser
  const user = session?.user as ExtendedUser;

  if (!session || (!user?.isSuperAdmin && !user?.isProfesor)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const skip = (page - 1) * limit;

    let whereClause: any = {};

    // If user is an instructor but not a super admin, filter by their own courses
    if (user?.isProfesor && !user?.isSuperAdmin) {
      whereClause.profesorId = user.id;
    }

    const [courses, totalCourses] = await prisma.$transaction([
      prisma.course.findMany({
        skip,
        take: limit,
        where: whereClause, // Apply filter here
        include: { profesor: true },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.course.count({ where: whereClause }), // Apply filter to count as well
    ]);

    return NextResponse.json({
      data: courses,
      pagination: {
        totalItems: totalCourses,
        totalPages: Math.ceil(totalCourses / limit),
        currentPage: page,
        pageSize: limit,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('[ADMIN_COURSES_GET]', error);
    return NextResponse.json({ message: 'Failed to fetch courses' }, { status: 500 });
  }
}
