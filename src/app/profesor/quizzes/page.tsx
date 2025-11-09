'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { PlusIcon, PencilIcon, TrashIcon, BookOpenIcon, CheckIcon } from '@heroicons/react/24/outline';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    throw new Error('Error al cargar los datos');
  }
  return res.json();
});

export default function QuizzesPage() {
  const { data: quizzes, error, isLoading } = useSWR<any[]>('/api/profesor/quizzes', fetcher);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [editingQuiz, setEditingQuiz] = useState<any | null>(null);

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizTitle.trim()) {
      toast.error('El título no puede estar vacío.');
      return;
    }

    try {
      await fetch('/api/profesor/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: newQuizTitle }),
      });
      setNewQuizTitle('');
      mutate('/api/profesor/quizzes');
      toast.success('Quiz creado exitosamente.');
    } catch (err) {
      toast.error('No se pudo crear el quiz.');
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este quiz?')) {
      try {
        const res = await fetch(`/api/profesor/quizzes/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Error al eliminar');
        }
        mutate('/api/profesor/quizzes');
        toast.success('Quiz eliminado.');
      } catch (err: any) {
        toast.error(err.message || 'No se pudo eliminar el quiz.');
      }
    }
  };

  const handleUpdateQuiz = async (quiz: any) => {
    if (!quiz.titulo.trim()) {
      toast.error('El título no puede estar vacío.');
      return;
    }
    try {
      await fetch(`/api/profesor/quizzes/${quiz.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: quiz.titulo }),
      });
      setEditingQuiz(null);
      mutate('/api/profesor/quizzes');
      toast.success('Quiz actualizado.');
    } catch (err) {
      toast.error('No se pudo actualizar el quiz.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Quizzes</h1>
      </div>

      {/* Formulario para crear nuevo Quiz */}
      <div className="mb-8 bg-white p-6 shadow-md rounded-lg">
        <form onSubmit={handleCreateQuiz} className="flex items-center gap-4">
          <input
            type="text"
            value={newQuizTitle}
            onChange={(e) => setNewQuizTitle(e.target.value)}
            placeholder="Título del nuevo quiz"
            className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Crear Quiz
          </button>
        </form>
      </div>

      {/* Tabla de Quizzes */}
      <div className="bg-white shadow-md rounded my-6">
        {isLoading && <div className="text-center p-10">Cargando quizzes...</div>}
        {error && <div className="text-center p-10 text-red-500">Error al cargar los quizzes.</div>}
        {!isLoading && !error && (
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-left text-xs font-semibold text-black uppercase tracking-wider">Título</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-left text-xs font-semibold text-black uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {quizzes?.map((quiz) => (
                <tr key={quiz.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {editingQuiz?.id === quiz.id ? (
                      <input
                        type="text"
                        value={editingQuiz.titulo}
                        onChange={(e) => setEditingQuiz({ ...editingQuiz, titulo: e.target.value })}
                        onBlur={() => handleUpdateQuiz(editingQuiz)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdateQuiz(editingQuiz)}
                        className="p-1 border border-gray-300 rounded-md"
                        autoFocus
                      />
                    ) : (
                      <p className="text-gray-900 whitespace-no-wrap">{quiz.titulo}</p>
                    )}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex items-center gap-2">
                      {editingQuiz?.id === quiz.id ? (
                        <>
                          <button 
                            onClick={() => handleUpdateQuiz(editingQuiz)} 
                            className="flex items-center gap-1 bg-green-100 text-green-600 hover:bg-green-200 px-2 py-1 rounded-md text-xs"
                          >
                            <CheckIcon className="h-4 w-4" />
                            Guardar
                          </button>
                          <button 
                            onClick={() => setEditingQuiz(null)} 
                            className="flex items-center gap-1 bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-1 rounded-md text-xs"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => setEditingQuiz({ ...quiz })} 
                          className="flex items-center gap-1 bg-indigo-100 text-indigo-600 hover:bg-indigo-200 px-2 py-1 rounded-md text-xs"
                        >
                          <PencilIcon className="h-4 w-4" />
                          Editar
                        </button>
                      )}
                      <Link 
                        href={`/profesor/quizzes/edit/${quiz.id}`} 
                        className="flex items-center gap-1 bg-green-100 text-green-600 hover:bg-green-200 px-2 py-1 rounded-md text-xs"
                      >
                        <BookOpenIcon className="h-4 w-4" />
                        Preguntas
                      </Link>
                      <button 
                        onClick={() => handleDeleteQuiz(quiz.id)} 
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