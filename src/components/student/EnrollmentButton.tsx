'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('No se pudo verificar el estado de inscripción.');
  }
  return res.json();
});

export default function EnrollmentButton({ courseId }: { courseId: string }) {
  const { data: session, status: sessionStatus } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Solo hacer fetch si el usuario está logueado
  const shouldFetch = sessionStatus === 'authenticated' && courseId;
  const { data, error, isLoading } = useSWR(
    shouldFetch ? `/api/student/enrollments?courseId=${courseId}` : null,
    fetcher
  );

  const handleEnrollRequest = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/student/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al enviar la solicitud.');
      }
      toast.success('Solicitud de inscripción enviada. Revisa tu correo para los siguientes pasos.');
      // Revalidar los datos para actualizar el estado del botón
      mutate(`/api/student/enrollments?courseId=${courseId}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si la sesión está cargando, no mostrar nada aún
  if (sessionStatus === 'loading' || (shouldFetch && isLoading)) {
    return (
      <div className="mt-6 p-4 bg-gray-100 rounded-lg animate-pulse h-16"></div>
    );
  }

  // Si el usuario no está logueado, mostrar un enlace para iniciar sesión
  if (sessionStatus === 'unauthenticated') {
    return (
      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400">
        <p className="font-bold">¿Quieres inscribirte?</p>
        <p>
          <Link href="/login" className="text-blue-600 hover:underline">Inicia sesión</Link> o <Link href="/register" className="text-blue-600 hover:underline">créate una cuenta</Link> para comenzar.
        </p>
      </div>
    );
  }

  // Si el usuario no es un estudiante, no mostrar el botón
  if (!session?.user?.isStudent) {
    return null;
  }

  // Renderizar el botón/estado basado en la respuesta de la API
  switch (data?.status) {
    case 'ENROLLED':
      return (
        <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-400">
          <p className="font-bold text-green-800">Ya estás inscrito en este curso.</p>
          <Link href="/student/dashboard" className="text-green-600 hover:underline">
            Ir a mi panel
          </Link>
        </div>
      );
    case 'PENDING':
      return (
        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
          <p className="font-bold text-yellow-800">Tu solicitud de inscripción está pendiente.</p>
          <p className="text-yellow-700">Recibirás una notificación cuando sea aprobada.</p>
        </div>
      );
    case 'REJECTED':
      return (
        <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400">
          <p className="font-bold text-red-800">Tu solicitud de inscripción fue rechazada.</p>
          <p className="text-red-700">Por favor, contacta a control escolar para más información.</p>
        </div>
      );
    case 'NOT_ENROLLED':
      return (
        <div className="mt-10 text-center">
          <button
            onClick={handleEnrollRequest}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Enviando Solicitud...' : '¡Inscríbeme ahora!'}
          </button>
        </div>
      );
    default:
      // Muestra un estado de carga o error si la data no está lista pero no hay error de SWR
      return <div className="mt-6 p-4 bg-gray-100 rounded-lg animate-pulse h-16"></div>;
  }
}
