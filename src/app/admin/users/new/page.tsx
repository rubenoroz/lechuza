'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewUserPage() {
  const [nombres, setNombres] = useState('');
  const [apellido_paterno, setApellidoPaterno] = useState('');
  const [apellido_materno, setApellidoMaterno] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // New state for boolean roles
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isEnrollmentAdmin, setIsEnrollmentAdmin] = useState(false);
  const [isProfesor, setIsProfesor] = useState(false);
  const [isStudent, setIsStudent] = useState(true); // Default new users to student

  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const requiredFields = { nombres, apellido_paterno, email, password };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        setError(`El campo ${key} es obligatorio.`);
        return;
      }
    }

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        nombres, 
        apellido_paterno, 
        apellido_materno,
        telefono,
        email, 
        password, 
        isSuperAdmin,
        isEnrollmentAdmin,
        isProfesor,
        isStudent,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || 'Error al crear el usuario');
    } else {
      router.push('/admin/users');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Crear Nuevo Usuario</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nombres">
              Nombre(s)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              id="nombres" type="text" placeholder="Nombre(s) del usuario"
              value={nombres} onChange={(e) => setNombres(e.target.value)} required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apellido_paterno">
              Apellido Paterno
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              id="apellido_paterno" type="text" placeholder="Apellido Paterno"
              value={apellido_paterno} onChange={(e) => setApellidoPaterno(e.target.value)} required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apellido_materno">
              Apellido Materno
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              id="apellido_materno" type="text" placeholder="Apellido Materno (Opcional)"
              value={apellido_materno} onChange={(e) => setApellidoMaterno(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="telefono">
              Teléfono
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              id="telefono" type="tel" placeholder="Teléfono (Opcional)"
              value={telefono} onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            id="email" type="email" placeholder="Email del Usuario"
            value={email} onChange={(e) => setEmail(e.target.value)} required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Contraseña
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            id="password" type="password" placeholder="******************"
            value={password} onChange={(e) => setPassword(e.target.value)} required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Roles
          </label>
          <div className="flex items-center mb-2">
            <input
              id="isSuperAdmin" type="checkbox" className="form-checkbox h-4 w-4 text-blue-600"
              checked={isSuperAdmin} onChange={(e) => setIsSuperAdmin(e.target.checked)}
            />
            <label htmlFor="isSuperAdmin" className="ml-2 text-gray-700">Super Administrador</label>
          </div>
          <div className="flex items-center mb-2">
            <input
              id="isEnrollmentAdmin" type="checkbox" className="form-checkbox h-4 w-4 text-blue-600"
              checked={isEnrollmentAdmin} onChange={(e) => setIsEnrollmentAdmin(e.target.checked)}
            />
            <label htmlFor="isEnrollmentAdmin" className="ml-2 text-gray-700">Admin de Control Escolar</label>
          </div>
          <div className="flex items-center mb-2">
            <input
              id="isProfesor" type="checkbox" className="form-checkbox h-4 w-4 text-blue-600"
              checked={isProfesor} onChange={(e) => setIsProfesor(e.target.checked)}
            />
            <label htmlFor="isProfesor" className="ml-2 text-gray-700">Profesor</label>
          </div>
          <div className="flex items-center">
            <input
              id="isStudent" type="checkbox" className="form-checkbox h-4 w-4 text-blue-600"
              checked={isStudent} onChange={(e) => setIsStudent(e.target.checked)}
            />
            <label htmlFor="isStudent" className="ml-2 text-gray-700">Estudiante</label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            type="submit"
          >
            Crear Usuario
          </button>
        </div>
      </form>
    </div>
  );
}
