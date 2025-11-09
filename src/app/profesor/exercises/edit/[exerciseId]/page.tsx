'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Exercise {
  id: string;
  instrucciones: string;
}

export default function EditExercisePage() {
  const params = useParams();
  const router = useRouter();
  const exerciseId = params.exerciseId as string;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExercise();
  }, [exerciseId]);

  const fetchExercise = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profesor/exercises/${exerciseId}`);
      if (!res.ok) {
        throw new Error('Error al cargar el ejercicio');
      }
      const data = await res.json();
      setExercise(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exercise?.instrucciones.trim()) {
      toast.error('Las instrucciones del ejercicio no pueden estar vacías.');
      return;
    }

    try {
      const res = await fetch(`/api/profesor/exercises/${exerciseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instrucciones: exercise.instrucciones }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al actualizar el ejercicio');
      }

      toast.success('Ejercicio actualizado exitosamente.');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Cargando ejercicio...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500 text-center">{error}</div>;
  }

  if (!exercise) {
    return <div className="container mx-auto p-4 text-center">Ejercicio no encontrado.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Editar Ejercicio</h1>
      <Link href="/profesor/exercises" className="text-blue-500 hover:underline mb-4 block">
        &larr; Volver a la gestión de Ejercicios
      </Link>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <form onSubmit={handleUpdateExercise}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="instrucciones">
              Instrucciones del Ejercicio
            </label>
            <textarea
              id="instrucciones"
              value={exercise.instrucciones}
              onChange={(e) => setExercise({ ...exercise, instrucciones: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              rows={10}
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Actualizando...' : 'Actualizar Ejercicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
