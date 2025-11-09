const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcrypt');
const { cursos } = require('../data/cursos.js');

const prisma = new PrismaClient();

async function main() {
  console.log('Limpiando la base de datos...');
  // Eliminar en orden inverso para evitar problemas de constraint
  await prisma.enrollment.deleteMany({});
  await prisma.resource.deleteMany({});
  await prisma.option.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.exercise.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});
  
  console.log('Base de datos limpiada.');

  console.log('Creando usuarios base...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@lechuza.com',
      password: hashedPassword,
      nombres: 'Admin',
      apellido_paterno: 'Principal',
      apellido_materno: 'Web',
      telefono: '1234567890',
      isSuperAdmin: true,
      isEnrollmentAdmin: true,
      isProfesor: true,
      isStudent: true,
    },
  });

  const profesorUser = await prisma.user.create({
    data: {
      email: 'profesor@lechuza.com',
      password: hashedPassword,
      nombres: 'Profesor',
      apellido_paterno: 'Lechuza',
      apellido_materno: 'Cursos',
      telefono: '0987654321',
      isProfesor: true,
      isEnrollmentAdmin: false,
      isStudent: false, // Un profesor no es estudiante por defecto
      biografia: 'Un apasionado profesor con más de 10 años de experiencia en desarrollo web y tecnologías modernas.'
    },
  });

  console.log(`Usuarios creados: ${adminUser.nombres}, ${profesorUser.nombres}`);

  console.log('Creando cursos desde data/cursos.js...');
  for (const curso of cursos) {
    const { modulos, ...cursoData } = curso;

    const nuevoCurso = await prisma.course.create({
      data: {
        ...cursoData,
        profesorId: profesorUser.id,
        modulos: {
          create: modulos.map(modulo => ({
            titulo: modulo.titulo,
            order: modulo.order,
            clases: {
              create: modulo.clases.map(clase => ({
                titulo: clase.titulo,
                tipo_contenido: clase.tipo_contenido,
                contenido_video: clase.contenido_video,
                contenido_texto: clase.contenido_texto,
                order: clase.order,
              })),
            },
          })),
        },
      },
      include: {
        modulos: {
          include: {
            clases: true,
          },
        },
      },
    });
    console.log(`- Curso creado: "${nuevoCurso.titulo}" con ${nuevoCurso.modulos.length} módulos.`);
  }

  console.log('¡Seeding completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
