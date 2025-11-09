'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CreateCoursePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [titulo, setTitulo] = useState('');
  const [slug, setSlug] = useState('');
  const [descripcion_corta, setDescripcionCorta] = useState('');
  const [descripcion_larga, setDescripcionLarga] = useState('');
  const [imagen_portada, setImagenPortada] = useState('');
  const [video_presentacion, setVideoPresentacion] = useState('');
  const [modalidad, setModalidad] = useState('OnlineGrabado');
  const [nivel, setNivel] = useState('Basico');
  const [publico_objetivo, setPublicoObjetivo] = useState('Profesionales');
  const [precio, setPrecio] = useState(0);
  const [instructorId, setInstructorId] = useState('');
  const [activo, setActivo] = useState(true); // New state for activo
  const [instructors, setInstructors] = useState([]);
  const [error, setError] = useState('');

  const isInstructorUser = session?.user?.isInstructor && !session?.user?.isSuperAdmin;
  const canEditActivo = session?.user?.isSuperAdmin; // Only Super Admins can edit activo

  useEffect(() => {
    // If the logged-in user is an instructor (and not a super admin), set their ID as the instructor
    if (isInstructorUser && session?.user?.id) {
      setInstructorId(session.user.id);
      setActivo(false); // Instructors create courses as inactive by default
    } else if (session?.user?.isSuperAdmin) {
      // Only fetch instructors if the user is a Super Admin
      const fetchInstructors = async () => {
        const res = await fetch('/api/admin/instructors');
        if (res.ok) {
          const data = await res.json();
          setInstructors(data);
          if (data.length > 0) {
            setInstructorId(data[0].id); // Set default instructor
          }
        } else {
          setError('Error al cargar los instructores');
        }
      };
      fetchInstructors();
    }
  }, [session, isInstructorUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/admin/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        titulo,
        slug,
        descripcion_corta,
        descripcion_larga,
        imagen_portada,
        video_presentacion,
        modalidad,
        nivel,
        publico_objetivo,
        precio: parseFloat(precio.toString()),
        instructorId,
        activo, // Include activo in the payload
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || 'Error al crear el curso');
    } else {
      router.push('/admin/courses');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Crear Nuevo Curso</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="titulo">
            Título
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="titulo"
            type="text"
            placeholder="Título del Curso"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="slug">
            Slug
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="slug"
            type="text"
            placeholder="titulo-del-curso"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="descripcion_corta">
            Descripción Corta
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="descripcion_corta"
            placeholder="Descripción corta del curso"
            value={descripcion_corta}
            onChange={(e) => setDescripcionCorta(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="descripcion_larga">
            Descripción Larga
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="descripcion_larga"
            placeholder="Descripción larga y detallada del curso"
            value={descripcion_larga}
            onChange={(e) => setDescripcionLarga(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imagen_portada">
            URL Imagen de Portada
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="imagen_portada"
            type="text"
            placeholder="https://example.com/imagen.jpg"
            value={imagen_portada}
            onChange={(e) => setImagenPortada(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="video_presentacion">
            URL Video de Presentación
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="video_presentacion"
            type="text"
            placeholder="https://example.com/video.mp4"
            value={video_presentacion}
            onChange={(e) => setVideoPresentacion(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="modalidad">
            Modalidad
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="modalidad"
            value={modalidad}
            onChange={(e) => setModalidad(e.target.value)}
          >
            <option value="OnlineGrabado">Online Grabado</option>
            <option value="OnlineEnVivo">Online En Vivo</option>
            <option value="Presencial">Presencial</option>
            <option value="Hibrido">Híbrido</option>
            <option value="CapacitacionEmpresas">Capacitación para Empresas</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nivel">
            Nivel
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="nivel"
            value={nivel}
            onChange={(e) => setNivel(e.target.value)}
          >
            <option value="Basico">Básico</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="publico_objetivo">
            Público Objetivo
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="publico_objetivo"
            value={publico_objetivo}
            onChange={(e) => setPublicoObjetivo(e.target.value)}
          >
            <option value="Profesionales">Profesionales</option>
            <option value="Ninos">Niños</option>
            <option value="General">General</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="precio">
            Precio
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="precio"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={precio}
            onChange={(e) => setPrecio(parseFloat(e.target.value))}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="instructorId">
            Instructor
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="instructorId"
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
            required
            disabled={isInstructorUser} // Disable if logged-in user is an instructor
          >
            {isInstructorUser ? (
              <option value={session?.user?.id}>{session?.user?.name}</option>
            ) : (
              instructors.map((instructor: any) => (
                <option key={instructor.id} value={instructor.id}>
                  {`${instructor.nombres} ${instructor.apellido_paterno} (${instructor.email})`}
                </option>
              ))
            )}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="activo">
            Activo (Publicado)
          </label>
          <input
            className="form-checkbox h-5 w-5 text-blue-600"
            id="activo"
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            disabled={!canEditActivo} // Only Super Admins can change this
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Crear Curso
          </button>
        </div>
      </form>
    </div>
  );
}