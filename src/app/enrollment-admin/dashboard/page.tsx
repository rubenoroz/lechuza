'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { toast } from 'react-hot-toast';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('No se pudieron cargar las solicitudes.');
  }
  return res.json();
});

type Status = 'PENDING' | 'APPROVED' | 'REJECTED';

export default function EnrollmentAdminDashboardPage() {
  const [filter, setFilter] = useState<Status>('PENDING');
  
  const { data: requests, error, isLoading } = useSWR<any[]>(
    `/api/admin/enrollment-requests?status=${filter}`, 
    fetcher
  );

  const handleProcessRequest = async (requestId: string, newStatus: Status) => {
    const action = newStatus === 'APPROVED' ? 'aprobada' : 'rechazada';
    if (!confirm(`¿Estás seguro de que quieres marcar esta solicitud como ${action}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/enrollment-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Error al procesar la solicitud.`);
      }
      
      toast.success(`Solicitud ${action} exitosamente.`);
      mutate(`/api/admin/enrollment-requests?status=${filter}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Solicitudes de Inscripción</h1>

      {/* Filtros */}
      <div className="mb-6 flex space-x-2">
        {(['PENDING', 'APPROVED', 'REJECTED'] as Status[]).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {status === 'PENDING' && 'Pendientes'}
            {status === 'APPROVED' && 'Aprobadas'}
            {status === 'REJECTED' && 'Rechazadas'}
          </button>
        ))}
      </div>

      {/* Tabla de Solicitudes */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {isLoading && <div className="text-center p-10">Cargando solicitudes...</div>}
        {error && <div className="text-center p-10 text-red-500">{error.message}</div>}
        {!isLoading && !error && (
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estudiante</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Curso</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha de Solicitud</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                {filter === 'PENDING' && <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>}
              </tr>
            </thead>
            <tbody>
              {requests?.map((req) => (
                <tr key={req.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{`${req.user.nombres} ${req.user.apellido_paterno}`}</p>
                    <p className="text-gray-600 whitespace-no-wrap text-xs">{req.user.email}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{req.course.titulo}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{new Date(req.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                      req.status === 'APPROVED' ? 'text-green-900' : 
                      req.status === 'REJECTED' ? 'text-red-900' : 'text-yellow-900'
                    }`}>
                      <span aria-hidden className={`absolute inset-0 ${
                        req.status === 'APPROVED' ? 'bg-green-200' : 
                        req.status === 'REJECTED' ? 'bg-red-200' : 'bg-yellow-200'
                      } opacity-50 rounded-full`}></span>
                      <span className="relative">{req.status}</span>
                    </span>
                  </td>
                  {filter === 'PENDING' && (
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                      <button
                        onClick={() => handleProcessRequest(req.id, 'APPROVED')}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-md text-xs mr-2"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleProcessRequest(req.id, 'REJECTED')}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md text-xs"
                      >
                        Rechazar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && requests?.length === 0 && (
          <div className="text-center p-10">
            <p>No hay solicitudes con el estado "{filter}".</p>
          </div>
        )}
      </div>
    </div>
  );
}

