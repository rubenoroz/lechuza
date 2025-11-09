'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { toast } from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    throw new Error('Error al cargar los datos');
  }
  return res.json();
});

export default function ExercisesPage() {
  const { data: exercises, error, isLoading } = useSWR<any[]>('/api/profesor/exercises', fetcher);
  const [newExerciseInstructions, setNewExerciseInstructions] = useState('');
  const [editingExercise, setEditingExercise] = useState<any | null>(null);

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExerciseInstructions.trim()) {
      toast.error('Las instrucciones no pueden estar vacías.');
      return;
    }

    try {
      await fetch('/api/profesor/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instrucciones: newExerciseInstructions }),
      });
      setNewExerciseInstructions('');
      mutate('/api/profesor/exercises');
      toast.success('Ejercicio creado exitosamente.');
    } catch (err) {
      toast.error('No se pudo crear el ejercicio.');
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este ejercicio?')) {
      try {
        const res = await fetch(`/api/profesor/exercises/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Error al eliminar');
        }
        mutate('/api/profesor/exercises');
        toast.success('Ejercicio eliminado.');
      } catch (err: any) {
        toast.error(err.message || 'No se pudo eliminar el ejercicio.');
      }
    }
  };

  const handleUpdateExercise = async (exercise: any) => {
    if (!exercise.instrucciones.trim()) {
      toast.error('Las instrucciones no pueden estar vacías.');
      return;
    }
    try {
      await fetch(`/api/profesor/exercises/${exercise.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instrucciones: exercise.instrucciones }),
      });
      setEditingExercise(null);
      mutate('/api/profesor/exercises');
      toast.success('Ejercicio actualizado.');
    } catch (err) {
      toast.error('No se pudo actualizar el ejercicio.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Ejercicios</h1>
      </div>

      {/* Formulario para crear nuevo Ejercicio */}
      <div className="mb-8 bg-white p-6 shadow-md rounded-lg">
        <form onSubmit={handleCreateExercise}>
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
            Instrucciones del Nuevo Ejercicio
          </label>
          <textarea
            id="instructions"
            rows={4}
            value={newExerciseInstructions}
            onChange={(e) => setNewExerciseInstructions(e.target.value)}
            placeholder="Escribe aquí las instrucciones para el ejercicio..."
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Crear Ejercicio
          </button>
        </form>
      </div>

      {/* Tabla de Ejercicios */}
      <div className="bg-white shadow-md rounded my-6">
        {isLoading && <div className="text-center p-10">Cargando ejercicios...</div>}
        {error && <div className="text-center p-10 text-red-500">Error al cargar los ejercicios.</div>}
        {!isLoading && !error && (
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-left text-xs font-semibold text-black uppercase tracking-wider">Instrucciones</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-left text-xs font-semibold text-black uppercase tracking-wider w-40">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {exercises?.map((exercise) => (
                <tr key={exercise.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {editingExercise?.id === exercise.id ? (
                      <textarea
                        value={editingExercise.instrucciones}
                        onChange={(e) => setEditingExercise({ ...editingExercise, instrucciones: e.target.value })}
                        onBlur={() => handleUpdateExercise(editingExercise)}
                        className="w-full p-1 border border-gray-300 rounded-md"
                        rows={3}
                        autoFocus
                      />
                    ) : (
                      <p className="text-gray-900 whitespace-pre-wrap">{exercise.instrucciones}</p>
                    )}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex items-center gap-2">
                      {editingExercise?.id === exercise.id ? (
                        <>
                          <button 
                            onClick={() => handleUpdateExercise(editingExercise)} 
                            className="flex items-center gap-1 bg-green-100 text-green-600 hover:bg-green-200 px-2 py-1 rounded-md text-xs"
                          >
                            <CheckIcon className="h-4 w-4" />
                            Guardar
                          </button>
                          <button 
                            onClick={() => setEditingExercise(null)} 
                            className="flex items-center gap-1 bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-1 rounded-md text-xs"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => setEditingExercise({ ...exercise })} 
                          className="flex items-center gap-1 bg-indigo-100 text-indigo-600 hover:bg-indigo-200 px-2 py-1 rounded-md text-xs"
                        >
                          <PencilIcon className="h-4 w-4" />
                          Editar
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteExercise(exercise.id)} 
                        className="flex items-center gap-1 bg-red-100 text-red-600 hover:bg-red-200 px-2 py-1 rounded-md text-xs"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}