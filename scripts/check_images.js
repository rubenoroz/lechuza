// scripts/check_images.js
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      titulo: true,
      imagen_portada: true,
    },
  });

  console.log('Cursos en la base de datos:');
  courses.forEach((course) => {
    console.log(`- ${course.titulo} (ID: ${course.id}): ${course.imagen_portada}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
