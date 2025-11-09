/*
  Warnings:

  - You are about to drop the column `isAdmin` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "image" TEXT,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isEnrollmentAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isInstructor" BOOLEAN NOT NULL DEFAULT false,
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
INSERT INTO "new_User" ("apellido_materno", "apellido_paterno", "biografia", "createdAt", "email", "foto_perfil", "id", "image", "isInstructor", "isStudent", "nombres", "numero_matricula", "password", "progreso_cursos", "telefono", "updatedAt") SELECT "apellido_materno", "apellido_paterno", "biografia", "createdAt", "email", "foto_perfil", "id", "image", "isInstructor", "isStudent", "nombres", "numero_matricula", "password", "progreso_cursos", "telefono", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_numero_matricula_key" ON "User"("numero_matricula");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
