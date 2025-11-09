import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  // Only Super Admins can export course data
  if (!session || !session.user?.isSuperAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const courses = await prisma.course.findMany({
      include: {
        profesor: {
          select: {
            nombres: true,
            apellido_paterno: true,
            apellido_materno: true,
            email: true, // Add email to the selection
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // CSV Headers
    const headers = [
      'ID',
      'Titulo',
      'Slug',
      'Descripcion Corta',
      'Descripcion Larga',
      'Imagen Portada',
      'Video Presentacion',
      'Modalidad',
      'Nivel',
      'Publico Objetivo',
      'Precio',
      'Activo',
      'ID Profesor',
      'Nombre Profesor',
      'Email Profesor',
      'Fecha Creacion',
      'Ultima Actualizacion',
    ];

    // Map course data to CSV rows
    const csvRows = courses.map((course) => {
      const profesorName = course.profesor ? `${course.profesor.nombres} ${course.profesor.apellido_paterno} ${course.profesor.apellido_materno || ''}`.trim() : 'N/A';
      const profesorEmail = course.profesor ? course.profesor.email : 'N/A'; // Assuming email is available on profesor

      return [
        course.id,
        course.titulo,
        course.slug,
        course.descripcion_corta,
        course.descripcion_larga,
        course.imagen_portada || '',
        course.video_presentacion || '',
        course.modalidad,
        course.nivel,
        course.publico_objetivo,
        course.precio,
        course.activo ? 'Sí' : 'No',
        course.instructorId,
        profesorName,
        profesorEmail,
        course.createdAt.toISOString(),
        course.updatedAt.toISOString(),
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','); // Escape double quotes and join
    });

    // Combine headers and rows
    const csv = [headers.join(','), ...csvRows].join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="cursos.csv"',
      },
    });
  } catch (error) {
    console.error('Error exporting courses to CSV:', error);
    return NextResponse.json({ message: 'Failed to export courses to CSV' }, { status: 500 });
  }
}
