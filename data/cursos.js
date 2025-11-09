const cursos = [
  {
    titulo: "Introducción a Next.js 14",
    slug: "introduccion-nextjs-14",
    descripcion_corta: "Aprende los fundamentos de Next.js y cómo construir aplicaciones web modernas.",
    descripcion_larga: "En este curso completo, exploraremos las características principales de Next.js 14, incluyendo el App Router, Server Components, y la integración con Prisma. Ideal para principiantes.",
    imagen_portada: "/images/course_image_1.jpg",
    video_presentacion: "https://www.youtube.com/watch?v=example",
    modalidad: "OnlineGrabado",
    nivel: "Basico",
    publico_objetivo: "Profesionales",
    precio: 49.99,
    activo: true,
    modulos: [
      {
        titulo: "Módulo 1: Fundamentos de Next.js",
        order: 1,
        clases: [
          {
            titulo: "1.1 - ¿Qué es Next.js?",
            tipo_contenido: "Video",
            contenido_video: "https://www.youtube.com/watch?v=video1_1",
            order: 1,
          },
          {
            titulo: "1.2 - Instalación y Configuración",
            tipo_contenido: "Texto",
            contenido_texto: "### Pasos para la instalación:\n1. `npx create-next-app@latest`\n2. ...",
            order: 2,
          },
        ],
      },
      {
        titulo: "Módulo 2: App Router y Componentes",
        order: 2,
        clases: [
          {
            titulo: "2.1 - Server Components vs Client Components",
            tipo_contenido: "Video",
            contenido_video: "https://www.youtube.com/watch?v=video2_1",
            order: 1,
          },
        ],
      },
    ],
  },
  {
    titulo: "Edición de Video para Niños con CapCut",
    slug: "edicion-video-capcut-ninos",
    descripcion_corta: "Un curso divertido para que los niños aprendan a editar videos y creen contenido increíble.",
    descripcion_larga: "Este curso está diseñado para niños de 8 a 12 años. Aprenderán a usar CapCut desde cero, añadiendo música, efectos y transiciones para crear sus propios videos para redes sociales.",
    imagen_portada: "/images/course_image_2.jpg",
    video_presentacion: "https://www.youtube.com/watch?v=example2",
    modalidad: "OnlineEnVivo",
    nivel: "Basico",
    publico_objetivo: "Ninos",
    precio: 29.99,
    activo: true,
    modulos: [
      {
        titulo: "Módulo 1: Conociendo CapCut",
        order: 1,
        clases: [
          {
            titulo: "1.1 - Tu primera edición",
            tipo_contenido: "Video",
            contenido_video: "https://www.youtube.com/watch?v=video_capcut_1",
            order: 1,
          },
        ],
      },
    ],
  },
  {
    titulo: "Curso Avanzado de Prisma ORM",
    slug: "curso-avanzado-prisma-orm",
    descripcion_corta: "Domina Prisma y lleva tus habilidades de gestión de bases de datos al siguiente nivel.",
    descripcion_larga: "Exploraremos temas avanzados como transacciones, optimización de consultas, y estrategias de migración complejas. Este curso es para desarrolladores con experiencia previa en Prisma.",
    imagen_portada: "/images/course_image_1.jpg",
    video_presentacion: "https://www.youtube.com/watch?v=example3",
    modalidad: "Presencial",
    nivel: "Avanzado",
    publico_objetivo: "Profesionales",
    precio: 99.99,
    activo: false,
    modulos: [],
  },
];

module.exports = {
  cursos,
};