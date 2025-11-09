'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast'; // Asumiendo que ya tienes react-hot-toast instalado

// Definiciones de tipos (asegúrate de que coincidan con tu esquema Prisma)
interface Class {
  id: string;
  titulo: string;
  tipo_contenido: 'Video' | 'Texto' | 'Quiz' | 'Ejercicio';
  contenido_video?: string;
  contenido_texto?: string;
  order: number;
  quizId?: string;
  exerciseId?: string;
  videoFilePath?: string;
  videoMimeType?: string;
  videoFileSize?: number;
  recursos_clase: any[]; // Puedes definir un tipo más específico para Resource si es necesario
  quiz?: Quiz; // Incluir el quiz asociado
  exercise?: Exercise; // Incluir el ejercicio asociado
}

interface Quiz {
  id: string;
  titulo: string;
}

interface Exercise {
  id: string;
  instrucciones: string;
}

export default function ModuleClassesPage() {
  const params = useParams();
  const courseId = params.id as string;
  const moduleId = params.moduleId as string;
  const searchParams = useSearchParams();
  const courseTitle = searchParams.get('courseTitle') || 'Cargando...';
  const moduleTitle = searchParams.get('moduleTitle') || 'Cargando...';

  const [classes, setClasses] = useState<Class[]>([]);
  const [newClassTitle, setNewClassTitle] = useState('');
  const [newClassContentType, setNewClassContentType] = useState<Class['tipo_contenido']>('Video');
  const [newClassVideoContent, setNewClassVideoContent] = useState('');
  const [newClassTextContent, setNewClassTextContent] = useState('');
  const [newClassQuizId, setNewClassQuizId] = useState('');
  const [newClassExerciseId, setNewClassExerciseId] = useState('');
  const [newSelectedVideoFile, setNewSelectedVideoFile] = useState<File | null>(null);
  const [newVideoUploading, setNewVideoUploading] = useState(false);

  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingClassTitle, setEditingClassTitle] = useState('');
  const [editingClassContentType, setEditingClassContentType] = useState<Class['tipo_contenido']>('Video');
  const [editingClassVideoContent, setEditingClassVideoContent] = useState('');
  const [editingClassTextContent, setEditingClassTextContent] = useState('');
  const [editingClassQuizId, setEditingClassQuizId] = useState('');
  const [editingClassExerciseId, setEditingClassExerciseId] = useState('');
  const [editingVideoFilePath, setEditingVideoFilePath] = useState('');
  const [editingVideoMimeType, setEditingVideoMimeType] = useState('');
  const [editingVideoFileSize, setEditingVideoFileSize] = useState<number | undefined>(undefined);
  const [editingSelectedVideoFile, setEditingSelectedVideoFile] = useState<File | null>(null);
  const [editingVideoUploading, setEditingVideoUploading] = useState(false);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]); // Para seleccionar quizzes existentes
  const [exercises, setExercises] = useState<Exercise[]>([]); // Para seleccionar ejercicios existentes

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchQuizzesAndExercises();
  }, [courseId, moduleId]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profesor/courses/${courseId}/modules/${moduleId}/classes`);
      if (!res.ok) {
        throw new Error('Error al cargar las clases');
      }
      const data = await res.json();
      setClasses(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzesAndExercises = async () => {
    try {
      const quizzesRes = await fetch(`/api/profesor/quizzes`);
      if (quizzesRes.ok) {
        const quizzesData = await quizzesRes.json();
        setQuizzes(quizzesData);
      } else {
        console.error('Error al cargar quizzes:', await quizzesRes.text());
        toast.error('Error al cargar quizzes.');
      }

      const exercisesRes = await fetch(`/api/profesor/exercises`);
      if (exercisesRes.ok) {
        const exercisesData = await exercisesRes.json();
        setExercises(exercisesData);
      } else {
        console.error('Error al cargar ejercicios:', await exercisesRes.text());
        toast.error('Error al cargar ejercicios.');
      }
    } catch (err: any) {
      console.error('Error al cargar quizzes y ejercicios:', err);
      toast.error('Error al cargar quizzes y ejercicios.');
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassTitle.trim()) {
      toast.error('El título de la clase no puede estar vacío.');
      return;
    }

    let classData: any = {
      titulo: newClassTitle,
      tipo_contenido: newClassContentType,
      contenido_texto: newClassTextContent,
      quizId: newClassQuizId || null,
      exerciseId: newClassExerciseId || null,
    };

    if (newClassContentType === 'Video') {
      if (!newClassVideoContent.trim() && !newSelectedVideoFile) {
        toast.error('Para contenido de video, se requiere una URL de video o un archivo de video.');
        return;
      }
      if (newClassVideoContent.trim() && newSelectedVideoFile) {
        toast.error('No puedes proporcionar una URL de video y subir un archivo de video al mismo tiempo.');
        return;
      }

      if (newSelectedVideoFile) {
        setNewVideoUploading(true);
        const formData = new FormData();
        formData.append('file', newSelectedVideoFile);

        try {
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!uploadRes.ok) {
            const errorData = await uploadRes.json();
            throw new Error(errorData.message || 'Error al subir el archivo de video');
          }

          const uploadResult = await uploadRes.json();
          classData = {
            ...classData,
            videoFilePath: uploadResult.filePath,
            videoMimeType: uploadResult.mimeType,
            videoFileSize: uploadResult.fileSize,
            contenido_video: null, // Si se sube un archivo, la URL debe ser nula
          };
          toast.success('Archivo de video subido exitosamente.');
        } catch (uploadError: any) {
          toast.error(uploadError.message);
          setNewVideoUploading(false);
          return;
        } finally {
          setNewVideoUploading(false);
        }
      } else {
        classData.contenido_video = newClassVideoContent;
      }
    }

    try {
      const res = await fetch(`/api/profesor/courses/${courseId}/modules/${moduleId}/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al añadir la clase');
      }

      toast.success('Clase añadida exitosamente.');
      setNewClassTitle('');
      setNewClassContentType('Video');
      setNewClassVideoContent('');
      setNewClassTextContent('');
      setNewClassQuizId('');
      setNewClassExerciseId('');
      setNewSelectedVideoFile(null);
      fetchClasses(); // Refrescar la lista de clases
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleEditClass = async (classId: string) => {
    if (!editingClassTitle.trim()) {
      toast.error('El título de la clase no puede estar vacío.');
      return;
    }

    let classData: any = {
      titulo: editingClassTitle,
      tipo_contenido: editingClassContentType,
      contenido_texto: editingClassTextContent,
      quizId: editingClassQuizId || null,
      exerciseId: editingClassExerciseId || null,
    };

    if (editingClassContentType === 'Video') {
      if (!editingClassVideoContent.trim() && !editingSelectedVideoFile && !editingVideoFilePath) {
        toast.error('Para contenido de video, se requiere una URL de video o un archivo de video.');
        return;
      }
      if (editingClassVideoContent.trim() && editingSelectedVideoFile) {
        toast.error('No puedes proporcionar una URL de video y subir un archivo de video al mismo tiempo.');
        return;
      }

      if (editingSelectedVideoFile) {
        setEditingVideoUploading(true);
        const formData = new FormData();
        formData.append('file', editingSelectedVideoFile);

        try {
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!uploadRes.ok) {
            const errorData = await uploadRes.json();
            throw new Error(errorData.message || 'Error al subir el archivo de video');
          }

          const uploadResult = await uploadRes.json();
          classData = {
            ...classData,
            videoFilePath: uploadResult.filePath,
            videoMimeType: uploadResult.mimeType,
            videoFileSize: uploadResult.fileSize,
            contenido_video: null, // Si se sube un archivo, la URL debe ser nula
          };
          toast.success('Archivo de video subido exitosamente.');
        } catch (uploadError: any) {
          toast.error(uploadError.message);
          setEditingVideoUploading(false);
          return;
        } finally {
          setEditingVideoUploading(false);
        }
      } else if (editingClassVideoContent.trim()) {
        classData.contenido_video = editingClassVideoContent;
        classData.videoFilePath = null; // Si se usa URL, el filePath debe ser nulo
        classData.videoMimeType = null;
        classData.videoFileSize = null;
      } else if (editingVideoFilePath) {
        classData.videoFilePath = editingVideoFilePath;
        classData.videoMimeType = editingVideoMimeType;
        classData.videoFileSize = editingVideoFileSize;
        classData.contenido_video = null;
      }
    }

    try {
      const res = await fetch(`/api/profesor/courses/${courseId}/modules/${moduleId}/classes/${classId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al actualizar la clase');
      }

      toast.success('Clase actualizada exitosamente.');
      setEditingClassId(null);
      setEditingClassTitle('');
      setEditingClassContentType('Video');
      setEditingClassVideoContent('');
      setEditingClassTextContent('');
      setEditingClassQuizId('');
      setEditingClassExerciseId('');
      setEditingSelectedVideoFile(null);
      setEditingVideoFilePath('');
      setEditingVideoMimeType('');
      setEditingVideoFileSize(undefined);
      fetchClasses(); // Refrescar la lista de clases
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta clase?')) {
      return;
    }

    try {
      const res = await fetch(`/api/profesor/courses/${courseId}/modules/${moduleId}/classes/${classId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al eliminar la clase');
      }

      toast.success('Clase eliminada exitosamente.');
      fetchClasses(); // Refrescar la lista de clases
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const startEditing = (cls: Class) => {
    setEditingClassId(cls.id);
    setEditingClassTitle(cls.titulo);
    setEditingClassContentType(cls.tipo_contenido);
    setEditingClassVideoContent(cls.contenido_video || '');
    setEditingClassTextContent(cls.contenido_texto || '');
    setEditingClassQuizId(cls.quizId || '');
    setEditingClassExerciseId(cls.exerciseId || '');
  };

  const cancelEditing = () => {
    setEditingClassId(null);
    setEditingClassTitle('');
    setEditingClassContentType('Video');
    setEditingClassVideoContent('');
    setEditingClassTextContent('');
    setEditingClassQuizId('');
    setEditingClassExerciseId('');
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Cargando clases...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Gestión de Clases para el Módulo: {moduleTitle} (Curso: {courseTitle})
      </h1>
      <Link href={`/profesor/courses/edit/${courseId}/modules?courseTitle=${encodeURIComponent(courseTitle)}`} className="text-blue-500 hover:underline mb-4 block">
        &larr; Volver a la gestión de módulos
      </Link>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Añadir Nueva Clase</h2>
        <form onSubmit={handleAddClass} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newClassTitle">
              Título de la Clase
            </label>
            <input
              type="text"
              id="newClassTitle"
              placeholder="Título de la Clase"
              value={newClassTitle}
              onChange={(e) => setNewClassTitle(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newClassContentType">
              Tipo de Contenido
            </label>
            <select
              id="newClassContentType"
              value={newClassContentType}
              onChange={(e) => setNewClassContentType(e.target.value as Class['tipo_contenido'])}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="Video">Video</option>
              <option value="Texto">Texto</option>
              <option value="Quiz">Quiz</option>
              <option value="Ejercicio">Ejercicio</option>
            </select>
          </div>

          {newClassContentType === 'Video' && (
            <div className="border-t pt-4 mt-4">
              <p className="block text-gray-700 text-sm font-bold mb-2">Origen del Video:</p>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newClassVideoContent">
                  URL del Video (ej. YouTube, Vimeo)
                </label>
                <input
                  type="url"
                  id="newClassVideoContent"
                  placeholder="URL del Video"
                  value={newClassVideoContent}
                  onChange={(e) => {
                    setNewClassVideoContent(e.target.value);
                    if (e.target.value) setNewSelectedVideoFile(null); // Limpiar archivo si se ingresa URL
                  }}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  disabled={!!newSelectedVideoFile}
                />
              </div>
              <p className="text-center text-gray-500 mb-2">O</p>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newVideoFile">
                  Subir Archivo de Video
                </label>
                <input
                  type="file"
                  id="newVideoFile"
                  onChange={(e) => {
                    setNewSelectedVideoFile(e.target.files ? e.target.files[0] : null);
                    if (e.target.files?.[0]) setNewClassVideoContent(''); // Limpiar URL si se selecciona archivo
                  }}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  disabled={!!newClassVideoContent.trim()}
                  accept="video/*"
                />
                {newSelectedVideoFile && <p className="text-gray-600 text-sm mt-1">Archivo seleccionado: {newSelectedVideoFile.name}</p>}
              </div>
            </div>
          )}
          {newClassContentType === 'Texto' && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newClassTextContent">
                Contenido de Texto
              </label>
              <textarea
                id="newClassTextContent"
                placeholder="Contenido de Texto"
                value={newClassTextContent}
                onChange={(e) => setNewClassTextContent(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows={5}
              />
            </div>
          )}
          {newClassContentType === 'Quiz' && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newClassQuizId">
                Seleccionar Quiz
              </label>
              <select
                id="newClassQuizId"
                value={newClassQuizId}
                onChange={(e) => setNewClassQuizId(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">-- Seleccionar Quiz --</option>
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>{quiz.titulo}</option>
                ))}
              </select>
              <p className="text-sm text-gray-600 mt-1">
                <Link href={`/profesor/quizzes/new`} className="text-blue-500 hover:underline">
                  Crear nuevo Quiz
                </Link>
              </p>
            </div>
          )}
          {newClassContentType === 'Ejercicio' && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newClassExerciseId">
                Seleccionar Ejercicio
              </label>
              <select
                id="newClassExerciseId"
                value={newClassExerciseId}
                onChange={(e) => setNewClassExerciseId(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">-- Seleccionar Ejercicio --</option>
                {exercises.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>{exercise.instrucciones.substring(0, 50)}...</option>
                ))}
              </select>
              <p className="text-sm text-gray-600 mt-1">
                <Link href={`/profesor/exercises/new`} className="text-blue-500 hover:underline">
                  Crear nuevo Ejercicio
                </Link>
              </p>
            </div>
          )}

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Añadir Clase
          </button>
        </form>
      </div>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Clases del Módulo</h2>
        {classes.length === 0 ? (
          <p>No hay clases creadas para este módulo aún.</p>
        ) : (
          <ul>
            {classes.map((cls) => (
              <li key={cls.id} className="flex justify-between items-center bg-gray-100 p-3 rounded mb-2">
                {editingClassId === cls.id ? (
                  <div className="flex-grow mr-2 space-y-2">
                    <input
                      type="text"
                      value={editingClassTitle}
                      onChange={(e) => setEditingClassTitle(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    <select
                      value={editingClassContentType}
                      onChange={(e) => setEditingClassContentType(e.target.value as Class['tipo_contenido'])}
                      className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                      <option value="Video">Video</option>
                      <option value="Texto">Texto</option>
                      <option value="Quiz">Quiz</option>
                      <option value="Ejercicio">Ejercicio</option>
                    </select>
                    {editingClassContentType === 'Video' && (
                      <div className="border-t pt-2 mt-2">
                        <p className="block text-gray-700 text-sm font-bold mb-2">Origen del Video:</p>
                        {editingVideoFilePath ? (
                          <p className="text-gray-600 text-sm mb-2">Video actual: <a href={editingVideoFilePath} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{editingVideoFilePath.split('/').pop()}</a></p>
                        ) : (
                          <input
                            type="url"
                            value={editingClassVideoContent}
                            onChange={(e) => {
                              setEditingClassVideoContent(e.target.value);
                              if (e.target.value) setEditingSelectedVideoFile(null);
                            }}
                            className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            disabled={!!editingSelectedVideoFile}
                          />
                        )}
                        <p className="text-center text-gray-500 my-2">O</p>
                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="editingVideoFile">
                            Subir Nuevo Archivo de Video
                          </label>
                          <input
                            type="file"
                            id="editingVideoFile"
                            onChange={(e) => {
                              setEditingSelectedVideoFile(e.target.files ? e.target.files[0] : null);
                              if (e.target.files?.[0]) setEditingClassVideoContent('');
                            }}
                            className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            disabled={!!editingClassVideoContent.trim()}
                            accept="video/*"
                          />
                          {editingSelectedVideoFile && <p className="text-gray-600 text-sm mt-1">Archivo seleccionado: {editingSelectedVideoFile.name}</p>}
                        </div>
                      </div>
                    )}
                    {editingClassContentType === 'Texto' && (
                      <textarea
                        placeholder="Contenido de Texto"
                        value={editingClassTextContent}
                        onChange={(e) => setEditingClassTextContent(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        rows={3}
                      />
                    )}
                    {editingClassContentType === 'Quiz' && (
                      <select
                        value={editingClassQuizId}
                        onChange={(e) => setEditingClassQuizId(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        <option value="">-- Seleccionar Quiz --</option>
                        {quizzes.map((quiz) => (
                          <option key={quiz.id} value={quiz.id}>{quiz.titulo}</option>
                        ))}
                      </select>
                    )}
                    {editingClassContentType === 'Ejercicio' && (
                      <select
                        value={editingClassExerciseId}
                        onChange={(e) => setEditingClassExerciseId(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        <option value="">-- Seleccionar Ejercicio --</option>
                        {exercises.map((exercise) => (
                          <option key={exercise.id} value={exercise.id}>{exercise.instrucciones.substring(0, 50)}...</option>
                        ))}
                      </select>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-800">
                    <span className="font-bold text-lg">{cls.order}. {cls.titulo}</span> ({cls.tipo_contenido})
                    {cls.tipo_contenido === 'Video' && cls.contenido_video && ` - Video URL: ${cls.contenido_video.substring(0, 30)}...`}
                    {cls.tipo_contenido === 'Video' && cls.videoFilePath && ` - Video Archivo: ${cls.videoFilePath.split('/').pop()} (${cls.videoMimeType}, ${cls.videoFileSize ? (cls.videoFileSize / 1024).toFixed(2) + ' KB' : 'N/A'})`}
                    {cls.tipo_contenido === 'Texto' && cls.contenido_texto && ` - Texto: ${cls.contenido_texto.substring(0, 30)}...`}
                    {cls.tipo_contenido === 'Quiz' && cls.quiz && ` - Quiz: ${cls.quiz.titulo}`}
                    {cls.tipo_contenido === 'Ejercicio' && cls.exercise && ` - Ejercicio: ${cls.exercise.instrucciones.substring(0, 30)}...`}
                  </span>
                )}
                <div>
                  {editingClassId === cls.id ? (
                    <>
                      <button
                        onClick={() => handleEditClass(cls.id)}
                        className="bg-green-500 hover:bg-green-700 text-white text-sm font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline ml-2"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="bg-gray-500 hover:bg-gray-700 text-white text-sm font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline ml-2"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(cls)}
                        className="bg-yellow-500 hover:bg-yellow-700 text-white text-sm font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline ml-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.id)}
                        className="bg-red-500 hover:bg-red-700 text-white text-sm font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline ml-2"
                      >
                        Eliminar
                      </button>
                      {/* Botón para gestionar recursos de la clase */}
                  <Link href={`/profesor/courses/edit/${courseId}/modules/${moduleId}/classes/${cls.id}/resources?courseTitle=${encodeURIComponent(courseTitle)}&moduleTitle=${encodeURIComponent(moduleTitle)}&classTitle=${encodeURIComponent(cls.titulo)}`} className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline ml-2">
                    Recursos
                  </Link>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
