'use client';

import { useState } from 'react';
import { mutate } from 'swr';
import { toast } from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function QuestionOptions({ question, quizId }: { question: any, quizId: string }) {
  const [newOptionText, setNewOptionText] = useState('');
  const [newOptionIsCorrect, setNewOptionIsCorrect] = useState(false);
  const [editingOption, setEditingOption] = useState<any | null>(null);

  const apiUrl = `/api/profesor/quizzes/${quizId}/questions/${question.id}/options`;
  const quizSWRKey = `/api/profesor/quizzes/${quizId}`;

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionText.trim()) {
      toast.error('El texto de la opción no puede estar vacío.');
      return;
    }
    try {
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: newOptionText, es_correcta: newOptionIsCorrect }),
      });
      setNewOptionText('');
      setNewOptionIsCorrect(false);
      mutate(quizSWRKey);
      toast.success('Opción añadida.');
    } catch (err) {
      toast.error('No se pudo añadir la opción.');
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta opción?')) {
      try {
        await fetch(`${apiUrl}/${optionId}`, { method: 'DELETE' });
        mutate(quizSWRKey);
        toast.success('Opción eliminada.');
      } catch (err) {
        toast.error('No se pudo eliminar la opción.');
      }
    }
  };

  const handleUpdateOption = async (option: any) => {
    if (option.texto && !option.texto.trim()) {
      toast.error('El texto de la opción no puede estar vacío.');
      return;
    }
    try {
      await fetch(`${apiUrl}/${option.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: option.texto, es_correcta: option.es_correcta }),
      });
      setEditingOption(null);
      mutate(quizSWRKey);
      toast.success('Opción actualizada.');
    } catch (err) {
      toast.error('No se pudo actualizar la opción.');
    }
  };

  const toggleCorrect = (option: any) => {
    handleUpdateOption({ ...option, es_correcta: !option.es_correcta });
  };

  return (
    <div className="mt-4 pl-6 border-l-2 border-gray-200">
      <h4 className="font-semibold text-sm text-gray-600 mb-2">Opciones:</h4>
      
      {/* Lista de Opciones */}
      <div className="space-y-2 mb-4">
        {question.opciones?.map((option: any) => (
          <div key={option.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50">
            <button onClick={() => toggleCorrect(option)} title="Marcar como correcta">
              {option.es_correcta ? (
                <CheckIcon className="h-6 w-6 text-green-500 bg-green-100 rounded-full p-1" />
              ) : (
                <div className="h-6 w-6 border-2 border-gray-300 rounded-full"></div>
              )}
            </button>

            <div className="flex-grow">
              {editingOption?.id === option.id ? (
                <input
                  type="text"
                  value={editingOption.texto}
                  onChange={(e) => setEditingOption({ ...editingOption, texto: e.target.value })}
                  onBlur={() => handleUpdateOption(editingOption)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateOption(editingOption)}
                  className="p-1 border border-gray-300 rounded-md w-full"
                  autoFocus
                />
              ) : (
                <p className={`text-sm ${option.es_correcta ? 'text-green-700 font-semibold' : 'text-gray-800'}`}>{option.texto}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setEditingOption({ ...option })} 
                className="flex items-center gap-1 bg-indigo-100 text-indigo-600 hover:bg-indigo-200 px-2 py-1 rounded-md text-xs"
              >
                <PencilIcon className="h-4 w-4" />
                Editar
              </button>
              <button 
                onClick={() => handleDeleteOption(option.id)} 
                className="flex items-center gap-1 bg-red-100 text-red-600 hover:bg-red-200 px-2 py-1 rounded-md text-xs"
              >
                <TrashIcon className="h-4 w-4" />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Formulario para nueva opción */}
      <form onSubmit={handleAddOption} className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
        <input
          type="text"
          value={newOptionText}
          onChange={(e) => setNewOptionText(e.target.value)}
          placeholder="Texto de la nueva opción"
          className="flex-grow p-2 border border-gray-300 rounded-md text-sm"
        />
        <label className="flex items-center gap-1 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={newOptionIsCorrect}
            onChange={(e) => setNewOptionIsCorrect(e.target.checked)}
            className="rounded"
          />
          ¿Correcta?
        </label>
        <button
          type="submit"
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-3 rounded-md flex items-center gap-1 text-sm"
        >
          <PlusIcon className="h-4 w-4" />
          Añadir
        </button>
      </form>
    </div>
  );
}
