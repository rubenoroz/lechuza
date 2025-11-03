// prisma/seed.js
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  // Crear usuarios de ejemplo (instructores y estudiantes)
  const instructor1 = await prisma.user.upsert({
    where: { email: 'instructor1@lechuza.com' },
    update: {},
    create: {
      email: 'instructor1@lechuza.com',
      name: 'Profesor Juan Pérez',
      nombre_completo: 'Juan Pérez García',
      foto_perfil: 'https://randomuser.me/api/portraits/men/1.jpg',
      biografia: 'Experto en producción audiovisual con más de 10 años de experiencia.',
      role: 'INSTRUCTOR',
      password: 'password123', // En un entorno real, esto debería ser hasheado
    },
  });

  const instructor2 = await prisma.user.upsert({
    where: { email: 'instructor2@lechuza.com' },
    update: {},
    create: {
      email: 'instructor2@lechuza.com',
      name: 'Profesora Ana Gómez',
      nombre_completo: 'Ana Gómez Ruiz',
      foto_perfil: 'https://randomuser.me/api/portraits/women/2.jpg',
      biografia: 'Especialista en diseño gráfico y herramientas digitales para niños.',
      role: 'INSTRUCTOR',
      password: 'password123',
    },
  });

  // Crear cursos de ejemplo
  const course1 = await prisma.course.upsert({
    where: { slug: 'produccion-audiovisual-basica' },
    update: {},
    create: {
      titulo: 'Producción Audiovisual Básica',
      slug: 'produccion-audiovisual-basica',
      descripcion_corta: 'Aprende los fundamentos de la producción de video y audio.',
      descripcion_larga: 'Este curso te introducirá en el emocionante mundo de la producción audiovisual, cubriendo desde la pre-producción hasta la post-producción.',
      imagen_portada: '/images/course_image_1.jpg',
      modalidad: 'OnlineGrabado',
      nivel: 'Basico',
      publico_objetivo: 'Profesionales',
      precio: 99.99,
      instructorId: instructor1.id,
      modulos: {
        create: [
          {
            titulo: 'Introducción a la Producción',
            order: 0,
            clases: {
              create: [
                { titulo: '¿Qué es la Producción Audiovisual?', tipo_contenido: 'Video', order: 0, contenido_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
                { titulo: 'Equipo Básico', tipo_contenido: 'Texto', order: 1, contenido_texto: 'Contenido sobre cámaras, micrófonos, etc.' },
              ],
            },
          },
          {
            titulo: 'Edición y Post-producción',
            order: 1,
            clases: {
              create: [
                { titulo: 'Principios de Edición', tipo_contenido: 'Video', order: 0, contenido_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
                { titulo: 'Color Grading', tipo_contenido: 'Texto', order: 1, contenido_texto: 'Contenido sobre corrección de color.' },
              ],
            },
          },
        ],
      },
    },
  });

  const course2 = await prisma.course.upsert({
    where: { slug: 'creacion-contenido-youtuber-ninos' },
    update: {},
    create: {
      titulo: 'Crea tu Canal de YouTube (para niños)',
      slug: 'creacion-contenido-youtuber-ninos',
      descripcion_corta: 'Aprende a crear videos divertidos y seguros para YouTube.',
      descripcion_larga: 'Un curso diseñado para que los niños exploren su creatividad y aprendan a producir contenido de video de forma segura y divertida.',
      imagen_portada: '/images/course_image_2.jpg',
      modalidad: 'OnlineEnVivo',
      nivel: 'Basico',
      publico_objetivo: 'Ninos',
      precio: 49.99,
      instructorId: instructor2.id,
      modulos: {
        create: [
          {
            titulo: 'Ideas y Guiones',
            order: 0,
            clases: {
              create: [
                { titulo: 'Brainstorming de Ideas', tipo_contenido: 'Texto', order: 0, contenido_texto: 'Cómo encontrar ideas geniales.' },
                { titulo: 'Escribiendo tu Primer Guion', tipo_contenido: 'Video', order: 1, contenido_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
              ],
            },
          },
          {
            titulo: 'Grabación y Edición Simple',
            order: 1,
            clases: {
              create: [
                { titulo: 'Consejos para Grabar', tipo_contenido: 'Video', order: 0, contenido_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
                { titulo: 'Edición con CapCut', tipo_contenido: 'Texto', order: 1, contenido_texto: 'Tutorial básico de edición.' },
              ],
            },
          },
        ],
      },
    },
  });

  console.log({ course1, course2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
