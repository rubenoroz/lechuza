-- CreateTable
CREATE TABLE "CourseDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
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
    CONSTRAINT "CourseDraft_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseDraft_courseId_key" ON "CourseDraft"("courseId");
