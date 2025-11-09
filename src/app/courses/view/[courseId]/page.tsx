'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import { BookOpenIcon, VideoCameraIcon, DocumentTextIcon, BeakerIcon, PuzzlePieceIcon, PaperClipIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import ReactPlayer from 'react-player';

const fetcher = (url: string) => fetch(url).then(res => {
  if (res.status === 403) {
    throw new Error('No tienes permiso para ver este curso. Por favor, asegúrate de estar inscrito.');
  }
  if (!res.ok) {
    throw new Error('Hubo un problema al cargar el contenido del curso.');
  }
  return res.json();
});

const contentIcon = (type: string) => {
  switch (type) {
    case 'Video': return <VideoCameraIcon className="h-5 w-5 mr-2" />;
    case 'Texto': return <DocumentTextIcon className="h-5 w-5 mr-2" />;
    case 'Quiz': return <PuzzlePieceIcon className="h-5 w-5 mr-2" />;
    case 'Ejercicio': return <BeakerIcon className="h-5 w-5 mr-2" />;
    default: return <BookOpenIcon className="h-5 w-5 mr-2" />;
  }
};

export default function CourseViewPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const { data: course, error, isLoading } = useSWR<any>(`/api/courses/${courseId}/content`, fetcher);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Al cargar el curso, selecciona la primera clase del primer módulo por defecto
    if (course?.modulos?.[0]?.clases?.[0]) {
      setSelectedClass(course.modulos[0].clases[0]);
      // Y abre el primer módulo
      const newOpenModules = new Set<string>();
      newOpenModules.add(course.modulos[0].id);
      setOpenModules(newOpenModules);
    }
  }, [course]);

  const toggleModule = (moduleId: string) => {
    setOpenModules(prevOpenModules => {
      const newOpenModules = new Set(prevOpenModules);
      if (newOpenModules.has(moduleId)) {
        newOpenModules.delete(moduleId);
      } else {
        newOpenModules.add(moduleId);
      }
      return newOpenModules;
    });
  };

  if (isLoading) {
    return <div className="text-center p-10">Cargando contenido del curso...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error.message}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar de Navegación del Curso */}
      <aside className="w-80 bg-white shadow-md flex flex-col h-full">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800 truncate">{course?.titulo}</h1>
        </div>
        <nav className="flex-grow overflow-y-auto">
          {course?.modulos.map((module: any) => (
            <div key={module.id} className="border-b">
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full text-left p-4 font-semibold flex justify-between items-center hover:bg-gray-50 text-gray-800"
              >
                {module.titulo}
                {openModules.has(module.id) ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
              </button>
              {openModules.has(module.id) && (
                <ul className="pl-4">
                  {module.clases.map((clase: any) => (
                    <li key={clase.id}>
                      <button
                        onClick={() => setSelectedClass(clase)}
                        className={`w-full text-left p-3 text-sm flex items-center rounded-md ${selectedClass?.id === clase.id ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-100 text-gray-700'}`}
                      >
                        {contentIcon(clase.tipo_contenido)}
                        {clase.titulo}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Área de Contenido Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        {selectedClass ? (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedClass.titulo}</h2>
            
            {/* Renderizador de Contenido */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              {selectedClass.tipo_contenido === 'Video' && (
                <div className="aspect-video">
                  {selectedClass.videoFilePath ? (
                     <video controls className="w-full rounded-md">
                        <source src={selectedClass.videoFilePath} type={selectedClass.videoMimeType || 'video/mp4'} />
                        Tu navegador no soporta el tag de video.
                      </video>
                  ) : selectedClass.contenido_video ? (
                    <ReactPlayer url={selectedClass.contenido_video} width="100%" height="100%" controls />
                  ) : <p>Contenido de video no disponible.</p>}
                </div>
              )}

              {selectedClass.tipo_contenido === 'Texto' && (
                <div className="prose max-w-none text-gray-900" dangerouslySetInnerHTML={{ __html: selectedClass.contenido_texto || '' }} />
              )}

              {selectedClass.tipo_contenido === 'Quiz' && (
                <div className="text-center p-8">
                  <PuzzlePieceIcon className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Quiz: {selectedClass.quiz.titulo}</h3>
                  <p className="text-gray-600 mb-6">Demuestra lo que has aprendido en esta sección.</p>
                  <Link href={`/student/quiz/${selectedClass.quizId}`} className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                    Comenzar Quiz
                  </Link>
                </div>
              )}

              {selectedClass.tipo_contenido === 'Ejercicio' && (
                 <div className="text-center p-8">
                    <BeakerIcon className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-4">Ejercicio Práctico</h3>
                    <p className="text-gray-600">La funcionalidad para completar ejercicios estará disponible pronto.</p>
                 </div>
              )}

              {/* Sección de Recursos */}
              {selectedClass.recursos_clase && selectedClass.recursos_clase.length > 0 && (
                <div className="mt-8 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Recursos de la Clase</h3>
                  <ul className="space-y-2">
                    {selectedClass.recursos_clase.map((resource: any) => (
                      <li key={resource.id}>
                        <a 
                          href={resource.filePath || resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <PaperClipIcon className="h-5 w-5 mr-3 text-gray-500" />
                          <span className="text-blue-600 hover:underline font-medium">{resource.nombre}</span>
                          <span className="text-gray-500 text-sm ml-2">({resource.tipo})</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BookOpenIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700">Bienvenido al curso</h2>
              <p className="text-gray-500 mt-2">Selecciona una clase del menú de la izquierda para comenzar.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
