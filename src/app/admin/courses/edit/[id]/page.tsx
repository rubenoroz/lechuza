'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth'; // Importar Session
import Link from 'next/link';

// Definir un tipo CustomSession que extienda la Session de NextAuth
interface CustomSession extends Session {
  user?: {
    id: string;
    isSuperAdmin?: boolean;
    isEnrollmentAdmin?: boolean;
    isProfesor?: boolean;
    isStudent?: boolean;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function EditCoursePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session } = useSession();
  const router = useRouter();

  const [titulo, setTitulo] = useState('');
  const [courseTitle, setCourseTitle] = useState(''); // Nuevo estado para el título del curso
  const [slug, setSlug] = useState('');
  const [descripcion_corta, setDescripcionCorta] = useState('');
  const [descripcion_larga, setDescripcionLarga] = useState('');
  const [imagen_portada, setImagenPortada] = useState('');
  const [video_presentacion, setVideoPresentacion] = useState('');
  const [modalidad, setModalidad] = useState('OnlineGrabado');
  const [nivel, setNivel] = useState('Basico');
  const [publico_objetivo, setPublicoObjetivo] = useState('Profesionales');
  const [precio, setPrecio] = useState(0);
  const [profesorId, setProfesorId] = useState('');
  const [activo, setActivo] = useState(true); // New state for activo
  const [profesores, setProfesores] = useState([]);
  const [error, setError] = useState('');

  const isProfesorUser = (session as CustomSession)?.user?.isProfesor && !(session as CustomSession)?.user?.isSuperAdmin;
  const canEditActivo = (session as CustomSession)?.user?.isSuperAdmin; // Only Super Admins can edit activo

  useEffect(() => {
    const fetchData = async () => {
      // Fetch course data
      const courseRes = await fetch(`/api/admin/courses/${id}`);
      if (courseRes.ok) {
        const courseData = await courseRes.json();
        setTitulo(courseData.titulo || '');
        setCourseTitle(courseData.titulo || ''); // Almacenar el título del curso
        setSlug(courseData.slug || '');
        setDescripcionCorta(courseData.descripcion_corta || '');
        setDescripcionLarga(courseData.descripcion_larga || '');
        setImagenPortada(courseData.imagen_portada || '');
        setVideoPresentacion(courseData.video_presentacion || '');
        setModalidad(courseData.modalidad || 'OnlineGrabado');
        setNivel(courseData.nivel || 'Basico');
        setPublicoObjetivo(courseData.publico_objetivo || 'Profesionales');
        setPrecio(courseData.precio || 0);
        setActivo(courseData.activo); // Populate activo state
        
        // If logged-in user is an instructor, set their ID as the instructorId
        if (isProfesorUser && (session as CustomSession)?.user?.id) {
          setProfesorId((session as CustomSession).user.id);
        } else {
          setProfesorId(courseData.instructorId || '');
        }
      } else {
        setError('Error al cargar los datos del curso');
      }

      // Solo obtener profesores si el usuario es un Super Admin
      if ((session as CustomSession)?.user?.isSuperAdmin) {
        const profesoresRes = await fetch('/api/admin/profesores');
        if (profesoresRes.ok) {
          const data = await profesoresRes.json();
          setProfesores(data);
        } else {
          setError((prev) => prev + ', Error al cargar los profesores');
        }
      }
    };
    fetchData();
  }, [id, session, isProfesorUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch(`/api/admin/courses/${id}`, {
      method: 'PUT',
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
        profesorId,
        activo, // Include activo in the payload
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || 'Error al actualizar el curso');
    } else {
      if (isProfesorUser) {
        router.push('/profesor/courses');
      } else {
        router.push('/admin/courses');
      }
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Editar Curso</h1>
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
            placeholder="titulo-del-curso-slug"
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
            placeholder="Descripción Corta"
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
            placeholder="Descripción Larga"
            value={descripcion_larga}
            onChange={(e) => setDescripcionLarga(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imagen_portada">
            URL de la Imagen de Portada
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="imagen_portada"
            type="text"
            placeholder="https://ejemplo.com/imagen.jpg"
            value={imagen_portada}
            onChange={(e) => setImagenPortada(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="video_presentacion">
            URL del Video de Presentación
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="video_presentacion"
            type="text"
            placeholder="https://ejemplo.com/video.mp4"
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
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profesorId">
            Profesor
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="profesorId"
            value={profesorId}
            onChange={(e) => setProfesorId(e.target.value)}
            required
            disabled={isProfesorUser} // Disable if logged-in user is an profesor
          >
            {isProfesorUser ? (
              <option value={session?.user?.id}>{session?.user?.name}</option>
            ) : (
              profesores.map((profesor: any) => (
                <option key={profesor.id} value={profesor.id}>
                  {`${profesor.nombres} ${profesor.apellido_paterno} (${profesor.email})`}
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
            Actualizar Curso
          </button>
        </div>
      </form>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Gestión de Contenido del Curso</h2>
        {courseTitle ? ( // Renderizar los enlaces solo cuando courseTitle esté disponible
          <div className="flex space-x-4">
            <Link href={`/profesor/courses/edit/${id}/modules?courseTitle=${encodeURIComponent(courseTitle)}`} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Gestionar Módulos
            </Link>
            <Link href={`/profesor/courses/edit/${id}/resources?courseTitle=${encodeURIComponent(courseTitle)}`} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Gestionar Recursos Generales
            </Link>
          </div>
        ) : (
          <p>Cargando opciones de gestión de contenido...</p>
        )}
      </div>
    </div>
  );
}
