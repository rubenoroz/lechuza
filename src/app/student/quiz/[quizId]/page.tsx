'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { toast } from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('No se pudo cargar el quiz. Asegúrate de tener permiso.');
  }
  return res.json();
});

type QuizState = 'taking' | 'submitting' | 'results';
type Answers = { [questionId: string]: string[] }; // Array of option IDs
type Results = {
  score: number;
  totalQuestions: number;
  percentage: number;
  results: {
    [questionId: string]: {
      correctOptionIds: string[];
      studentOptionIds: string[];
      isCorrect: boolean;
    };
  };
};

export default function TakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const { data: quiz, error, isLoading } = useSWR<any>(`/api/student/quizzes/${quizId}`, fetcher);

  const [quizState, setQuizState] = useState<QuizState>('taking');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Answers>({});
  const [results, setResults] = useState<Results | null>(null);
  const [showReview, setShowReview] = useState(false);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      const newAnswers = currentAnswers.includes(optionId)
        ? currentAnswers.filter(id => id !== optionId) // Uncheck
        : [...currentAnswers, optionId]; // Check
      return { ...prev, [questionId]: newAnswers };
    });
  };

  const handleSubmit = async () => {
    const answeredQuestions = Object.values(selectedAnswers).filter(answer => answer.length > 0).length;
    if (answeredQuestions !== quiz?.preguntas?.length) {
      if (!confirm('No has respondido todas las preguntas. ¿Estás seguro de que quieres terminar?')) {
        return;
      }
    }
    setQuizState('submitting');
    try {
      const res = await fetch(`/api/student/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: selectedAnswers }),
      });
      if (!res.ok) {
        throw new Error('Error al enviar tus respuestas.');
      }
      const resultData = await res.json();
      setResults(resultData);
      setQuizState('results');
      toast.success('¡Quiz completado!');
    } catch (err: any) {
      toast.error(err.message);
      setQuizState('taking');
    }
  };

  if (isLoading) return <div className="text-center p-10">Cargando Quiz...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error.message}</div>;

  const currentQuestion = quiz?.preguntas?.[currentQuestionIndex];
  const progressPercentage = quiz?.preguntas ? ((currentQuestionIndex + 1) / quiz.preguntas.length) * 100 : 0;

  // Vista de Resultados
  if (quizState === 'results' && results) {
    return (
      <div className="container mx-auto max-w-3xl p-4 md:p-8">
        <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Resultados del Quiz</h1>
            <h2 className="text-xl text-gray-600 mb-6">{quiz.titulo}</h2>
            <p className="text-5xl font-bold text-blue-600 mb-4">
              {results.percentage.toFixed(0)}%
            </p>
            <p className="text-lg text-gray-700 mb-8">
              Respondiste correctamente {results.score} de {results.totalQuestions} preguntas.
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={() => router.back()} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg">
                Volver al Curso
              </button>
              <button onClick={() => setShowReview(!showReview)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg">
                {showReview ? 'Ocultar Revisión' : 'Revisar Respuestas'}
              </button>
            </div>
          </div>
        </div>

        {/* Sección de Revisión */}
        {showReview && (
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Revisión de Respuestas</h3>
            <div className="space-y-6">
              {quiz.preguntas.map((question: any, index: number) => {
                const questionResult = results.results[question.id];
                return (
                  <div key={question.id} className="border-b pb-6">
                    <div className="flex items-start">
                      <span className={`mr-4 font-bold ${questionResult.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                        {index + 1}.
                      </span>
                      <h4 className="flex-grow text-lg font-semibold text-gray-800">{question.texto}</h4>
                      {questionResult.isCorrect 
                        ? <CheckCircleIcon className="h-6 w-6 text-green-500" /> 
                        : <XCircleIcon className="h-6 w-6 text-red-500" />
                      }
                    </div>
                    <div className="mt-4 pl-8 space-y-2">
                      {question.opciones.map((option: any) => {
                        const isCorrect = questionResult.correctOptionIds.includes(option.id);
                        const wasSelected = questionResult.studentOptionIds.includes(option.id);
                        
                        let optionStyle = 'text-gray-700';
                        if (isCorrect) optionStyle = 'text-green-700 font-bold';
                        if (!isCorrect && wasSelected) optionStyle = 'text-red-700 line-through';

                        return (
                          <div key={option.id} className="flex items-center">
                            {isCorrect 
                              ? <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
                              : wasSelected 
                                ? <XCircleIcon className="h-5 w-5 mr-2 text-red-500" />
                                : <div className="h-5 w-5 mr-2"></div>
                            }
                            <span className={optionStyle}>{option.texto}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vista para tomar el Quiz
  return (
    <div className="container mx-auto max-w-3xl p-4 md:p-8">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{quiz.titulo}</h1>
        <p className="text-sm text-gray-500 mb-6">Pregunta {currentQuestionIndex + 1} de {quiz.preguntas.length}</p>

        {/* Barra de Progreso */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
        </div>

        {currentQuestion && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-6">{currentQuestion.texto}</h2>
            <div className="space-y-4">
              {currentQuestion.opciones.map((option: any) => (
                <label
                  key={option.id}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${selectedAnswers[currentQuestion.id]?.includes(option.id) ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-300 hover:border-blue-400'}`}
                >
                  <input
                    type="checkbox"
                    name={`question-${currentQuestion.id}`}
                    value={option.id}
                    checked={selectedAnswers[currentQuestion.id]?.includes(option.id) || false}
                    onChange={() => handleSelectOption(currentQuestion.id, option.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-4 text-gray-700">{option.texto}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Navegación */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <button
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            disabled={currentQuestionIndex === 0}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          
          {currentQuestionIndex < quiz.preguntas.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={quizState === 'submitting'}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
            >
              {quizState === 'submitting' ? 'Enviando...' : 'Finalizar Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
