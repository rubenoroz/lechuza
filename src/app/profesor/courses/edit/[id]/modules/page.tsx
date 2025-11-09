'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast'; // Asumiendo que ya tienes react-hot-toast instalado
import { useSession } from 'next-auth/react'; // Importar useSession

interface Module {
  id: string;
  titulo: string;
  order: number;
  clases: any[]; // Puedes definir un tipo más específico para Class si es necesario
}

export default function CourseModulesPage() {
  const params = useParams();
  const courseId = params.id as string;
  const searchParams = useSearchParams();
  const courseTitle = searchParams.get('courseTitle') || 'Cargando...';
  const [currentCourseTitle, setCurrentCourseTitle] = useState(courseTitle);
  const { data: session } = useSession(); // Obtener la sesión

  const [modules, setModules] = useState<Module[]>([]);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModules();
    if (courseTitle === 'Cargando...') {
      const fetchCourseTitle = async () => {
        try {
          const res = await fetch(`/api/admin/courses/${courseId}`);
          if (res.ok) {
            const data = await res.json();
            setCurrentCourseTitle(data.titulo);
          }
        } catch (err) {
          console.error('Error fetching course title:', err);
        }
      };
      fetchCourseTitle();
    }
  }, [courseId, courseTitle]);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profesor/courses/${courseId}/modules`);
      if (!res.ok) {
        throw new Error('Error al cargar los módulos');
      }
      const data = await res.json();
      setModules(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) {
      toast.error('El título del módulo no puede estar vacío.');
      return;
    }

    try {
      const res = await fetch(`/api/profesor/courses/${courseId}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ titulo: newModuleTitle }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al añadir el módulo');
      }

      toast.success('Módulo añadido exitosamente.');
      setNewModuleTitle('');
      fetchModules(); // Refrescar la lista de módulos
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleEditModule = async (moduleId: string) => {
    if (!editingModuleTitle.trim()) {
      toast.error('El título del módulo no puede estar vacío.');
      return;
    }

    try {
      const res = await fetch(`/api/profesor/courses/${courseId}/modules/${moduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ titulo: editingModuleTitle }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al actualizar el módulo');
      }

      toast.success('Módulo actualizado exitosamente.');
      setEditingModuleId(null);
      setEditingModuleTitle('');
      fetchModules(); // Refrescar la lista de módulos
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este módulo? Todas las clases y contenidos asociados se eliminarán.')) {
      return;
    }

    try {
      const res = await fetch(`/api/profesor/courses/${courseId}/modules/${moduleId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al eliminar el módulo');
      }

      toast.success('Módulo eliminado exitosamente.');
      fetchModules(); // Refrescar la lista de módulos
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Cargando módulos...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Gestión de Módulos para el Curso: {currentCourseTitle}
      </h1>
      <Link href={`/profesor/courses/edit/${courseId}`} className="text-blue-500 hover:underline mb-4 block">
        &larr; Volver a la edición del curso
      </Link>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Añadir Nuevo Módulo</h2>
        <form onSubmit={handleAddModule} className="flex gap-4">
          <input
            type="text"
            placeholder="Título del Módulo"
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Añadir Módulo
          </button>
        </form>
      </div>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Módulos del Curso</h2>
        {modules.length === 0 ? (
          <p>No hay módulos creados para este curso aún.</p>
        ) : (
          <ul>
            {modules.map((module) => (
              <li key={module.id} className="flex justify-between items-center bg-gray-100 p-3 rounded mb-2">
                {editingModuleId === module.id ? (
                  <input
                    type="text"
                    value={editingModuleTitle}
                    onChange={(e) => setEditingModuleTitle(e.target.value)}
                    className="shadow appearance-none border rounded py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-grow mr-2"
                  />
                ) : (
                  <span className="text-gray-800"><span className="font-bold text-lg">{module.order}. {module.titulo}</span> ({module.clases.length} clases)</span>
                )}
                <div>
                  {editingModuleId === module.id ? (
                    <>
                      <button
                        onClick={() => handleEditModule(module.id)}
                        className="bg-green-500 hover:bg-green-700 text-white text-sm font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline ml-2"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => { setEditingModuleId(null); setEditingModuleTitle(''); }}
                        className="bg-gray-500 hover:bg-gray-700 text-white text-sm font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline ml-2"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setEditingModuleId(module.id); setEditingModuleTitle(module.titulo); }}
                        className="bg-yellow-500 hover:bg-yellow-700 text-white text-sm font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline ml-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteModule(module.id)}
                        className="bg-red-500 hover:bg-red-700 text-white text-sm font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline ml-2"
                      >
                        Eliminar
                      </button>
                      <Link href={`/profesor/courses/edit/${courseId}/modules/${module.id}/classes?courseTitle=${encodeURIComponent(currentCourseTitle)}&moduleTitle=${encodeURIComponent(module.titulo)}`} className="bg-purple-500 hover:bg-purple-700 text-white text-sm font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline ml-2">
                        Gestionar Clases
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


