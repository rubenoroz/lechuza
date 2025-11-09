/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `nombre_completo` on the `User` table. All the data in the column will be lost.
  - Added the required column `apellido_paterno` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombres` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
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
INSERT INTO "new_User" ("biografia", "createdAt", "email", "foto_perfil", "id", "image", "numero_matricula", "password", "progreso_cursos", "role", "updatedAt") SELECT "biografia", "createdAt", "email", "foto_perfil", "id", "image", "numero_matricula", "password", "progreso_cursos", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_numero_matricula_key" ON "User"("numero_matricula");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
