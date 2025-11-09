const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  try {
    const profesorUser = await prisma.user.findUnique({
      where: { email: 'profesor@lechuza.com' },
      select: { id: true },
    });

    if (!profesorUser) {
      console.log('Usuario profesor no encontrado.');
      return;
    }

    console.log('ID del usuario profesor:', profesorUser.id);

    const course = await prisma.course.findFirst({
      where: { profesorId: profesorUser.id },
      select: { id: true, titulo: true, profesorId: true },
    });

    if (!course) {
      console.log('No se encontraron cursos asignados al profesor.');
      return;
    }

    console.log('ID del curso:', course.id);
    console.log('Título del curso:', course.titulo);
    console.log('profesorId del curso:', course.profesorId);

    if (profesorUser.id === course.profesorId) {
      console.log('¡Los IDs del profesor coinciden!');
    } else {
      console.log('¡ERROR: Los IDs del profesor NO coinciden!');
    }

  } catch (e) {
    console.error('Error al verificar los IDs:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
