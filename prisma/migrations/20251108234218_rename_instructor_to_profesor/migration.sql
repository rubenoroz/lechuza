/*
  Warnings:

  - You are about to drop the column `instructorId` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `instructorId` on the `CourseDraft` table. All the data in the column will be lost.
  - You are about to drop the column `isInstructor` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion_corta" TEXT NOT NULL,
    "descripcion_larga" TEXT NOT NULL,
    "imagen_portada" TEXT,
    "video_presentacion" TEXT,
    "modalidad" TEXT NOT NULL,
    "nivel" TEXT NOT NULL,
    "publico_objetivo" TEXT NOT NULL,
    "precio" REAL NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "profesorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Course_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Course" ("activo", "createdAt", "descripcion_corta", "descripcion_larga", "id", "imagen_portada", "modalidad", "nivel", "precio", "publico_objetivo", "slug", "titulo", "updatedAt", "video_presentacion") SELECT "activo", "createdAt", "descripcion_corta", "descripcion_larga", "id", "imagen_portada", "modalidad", "nivel", "precio", "publico_objetivo", "slug", "titulo", "updatedAt", "video_presentacion" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");
CREATE TABLE "new_CourseDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "profesorId" TEXT,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion_corta" TEXT NOT NULL,
    "descripcion_larga" TEXT NOT NULL,
    "imagen_portada" TEXT,
    "video_presentacion" TEXT,
    "modalidad" TEXT NOT NULL,
    "nivel" TEXT NOT NULL,
    "publico_objetivo" TEXT NOT NULL,
    "precio" REAL NOT NULL,
    "isPendingReview" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CourseDraft_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CourseDraft_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CourseDraft" ("courseId", "createdAt", "descripcion_corta", "descripcion_larga", "id", "imagen_portada", "isPendingReview", "modalidad", "nivel", "precio", "publico_objetivo", "slug", "titulo", "updatedAt", "video_presentacion") SELECT "courseId", "createdAt", "descripcion_corta", "descripcion_larga", "id", "imagen_portada", "isPendingReview", "modalidad", "nivel", "precio", "publico_objetivo", "slug", "titulo", "updatedAt", "video_presentacion" FROM "CourseDraft";
DROP TABLE "CourseDraft";
ALTER TABLE "new_CourseDraft" RENAME TO "CourseDraft";
CREATE UNIQUE INDEX "CourseDraft_courseId_key" ON "CourseDraft"("courseId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "image" TEXT,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isEnrollmentAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isProfesor" BOOLEAN NOT NULL DEFAULT false,
    "isStudent" BOOLEAN NOT NULL DEFAULT true,
    "nombres" TEXT NOT NULL,
    "apellido_paterno" TEXT NOT NULL,
    "apellido_materno" TEXT,
    "telefono" TEXT,
    "foto_perfil" TEXT,
    "biografia" TEXT,
    "numero_matricula" TEXT,
    "progreso_cursos" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("apellido_materno", "apellido_paterno", "biografia", "createdAt", "email", "foto_perfil", "id", "image", "isEnrollmentAdmin", "isStudent", "isSuperAdmin", "nombres", "numero_matricula", "password", "progreso_cursos", "telefono", "updatedAt") SELECT "apellido_materno", "apellido_paterno", "biografia", "createdAt", "email", "foto_perfil", "id", "image", "isEnrollmentAdmin", "isStudent", "isSuperAdmin", "nombres", "numero_matricula", "password", "progreso_cursos", "telefono", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_numero_matricula_key" ON "User"("numero_matricula");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
