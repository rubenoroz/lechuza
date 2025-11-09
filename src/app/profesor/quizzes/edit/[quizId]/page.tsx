'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { PlusIcon, PencilIcon, TrashIcon, ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import QuestionOptions from '@/components/profesor/QuestionOptions';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    throw new Error('Error al cargar los datos');
  }
  return res.json();
});

export default function EditQuizPage() {
  const params = useParams();
  const quizId = params.quizId as string;

  const { data: quiz, error, isLoading } = useSWR<any>(`/api/profesor/quizzes/${quizId}`, fetcher);

  const [newQuestionText, setNewQuestionText] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) {
      toast.error('El texto de la pregunta no puede estar vacío.');
      return;
    }
    try {
      await fetch(`/api/profesor/quizzes/${quizId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: newQuestionText }),
      });
      setNewQuestionText('');
      mutate(`/api/profesor/quizzes/${quizId}`);
      toast.success('Pregunta añadida.');
    } catch (err) {
      toast.error('No se pudo añadir la pregunta.');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
      try {
        await fetch(`/api/profesor/quizzes/${quizId}/questions/${questionId}`, { method: 'DELETE' });
        mutate(`/api/profesor/quizzes/${quizId}`);
        toast.success('Pregunta eliminada.');
      } catch (err) {
        toast.error('No se pudo eliminar la pregunta.');
      }
    }
  };

  const handleUpdateQuestion = async (question: any) => {
    if (!question.texto.trim()) {
      toast.error('El texto de la pregunta no puede estar vacío.');
      return;
    }
    try {
      await fetch(`/api/profesor/quizzes/${quizId}/questions/${question.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: question.texto }),
      });
      setEditingQuestion(null);
      mutate(`/api/profesor/quizzes/${quizId}`);
      toast.success('Pregunta actualizada.');
    } catch (err) {
      toast.error('No se pudo actualizar la pregunta.');
    }
  };

  if (isLoading) return <div className="text-center p-10">Cargando quiz...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error al cargar el quiz.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/profesor/quizzes" className="text-indigo-600 hover:text-indigo-900 flex items-center gap-2">
          <ArrowLeftIcon className="h-5 w-5" />
          Volver a la lista de Quizzes
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestionar Preguntas</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-8">{quiz?.titulo}</h2>

      {/* Formulario para crear nueva Pregunta */}
      <div className="mb-8 bg-white p-6 shadow-md rounded-lg">
        <form onSubmit={handleAddQuestion} className="flex items-center gap-4">
          <input
            type="text"
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            placeholder="Texto de la nueva pregunta"
            className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Añadir Pregunta
          </button>
        </form>
      </div>

      {/* Lista de Preguntas */}
      <div className="space-y-4">
        {quiz?.preguntas.map((question: any, index: number) => (
          <div key={question.id} className="bg-white p-4 shadow rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <span className="font-bold text-black mr-2">{index + 1}.</span>
                {editingQuestion?.id === question.id ? (
                  <input
                    type="text"
                    value={editingQuestion.texto}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, texto: e.target.value })}
                    onBlur={() => handleUpdateQuestion(editingQuestion)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateQuestion(editingQuestion)}
                    className="p-1 border border-gray-300 rounded-md w-full"
                    autoFocus
                  />
                ) : (
                  <p className="text-gray-900 inline">{question.texto}</p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                {editingQuestion?.id === question.id ? (
                  <>
                    <button 
                      onClick={() => handleUpdateQuestion(editingQuestion)} 
                      className="flex items-center gap-1 bg-green-100 text-green-600 hover:bg-green-200 px-2 py-1 rounded-md text-xs"
                    >
                      <CheckIcon className="h-4 w-4" />
                      Guardar
                    </button>
                    <button 
                      onClick={() => setEditingQuestion(null)} 
                      className="flex items-center gap-1 bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-1 rounded-md text-xs"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setEditingQuestion({ ...question })} 
                    className="flex items-center gap-1 bg-indigo-100 text-indigo-600 hover:bg-indigo-200 px-2 py-1 rounded-md text-xs"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Editar
                  </button>
                )}
                <button 
                  onClick={() => handleDeleteQuestion(question.id)} 
                  className="flex items-center gap-1 bg-red-100 text-red-600 hover:bg-red-200 px-2 py-1 rounded-md text-xs"
                >
                  <TrashIcon className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            </div>
            
            {/* Sección para Opciones */}
            <QuestionOptions question={question} quizId={quizId} />
          </div>
        ))}
      </div>
    </div>
  );
}