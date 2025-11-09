'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Resource {
  id: string;
  nombre: string;
  url?: string;
  tipo: string;
  filePath?: string;
  mimeType?: string;
  fileSize?: number;
}

export default function ClassResourcesPage() {
  const params = useParams();
  const courseId = params.id as string;
  const moduleId = params.moduleId as string;
  const classId = params.classId as string;
  const searchParams = useSearchParams();
  const courseTitle = searchParams.get('courseTitle') || 'Cargando...';
  const moduleTitle = searchParams.get('moduleTitle') || 'Cargando...';
  const classTitle = searchParams.get('classTitle') || 'Cargando...';

  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [newResourceType, setNewResourceType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [editingResourceName, setEditingResourceName] = useState('');
  const [editingResourceUrl, setEditingResourceUrl] = useState('');
  const [editingResourceType, setEditingResourceType] = useState('');
  const [editingFilePath, setEditingFilePath] = useState('');
  const [editingMimeType, setEditingMimeType] = useState('');
  const [editingFileSize, setEditingFileSize] = useState<number | undefined>(undefined);
  const [editingSelectedFile, setEditingSelectedFile] = useState<File | null>(null);
  const [editingUploading, setEditingUploading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  console.log("setResources on mount:", setResources);

  useEffect(() => {
    fetchResources();
  }, [courseId, moduleId, classId]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profesor/courses/${courseId}/modules/${moduleId}/classes/${classId}/resources`);
      if (!res.ok) {
        throw new Error('Error al cargar los recursos');
      }
      const data = await res.json();
      setResources(data);
    } catch (err: any) {
      setFetchError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResourceName.trim() || !newResourceType.trim()) {
      toast.error('El nombre y el tipo del recurso son obligatorios.');
      return;
    }

    if (!newResourceUrl.trim() && !selectedFile) {
      toast.error('Debes proporcionar una URL o subir un archivo.');
      return;
    }

    if (newResourceUrl.trim() && selectedFile) {
      toast.error('No puedes proporcionar una URL y subir un archivo al mismo tiempo.');
      return;
    }

    let resourceData: any = {
      nombre: newResourceName,
      tipo: newResourceType,
    };

    if (selectedFile) {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.message || 'Error al subir el archivo');
        }

        const uploadResult = await uploadRes.json();
        resourceData = {
          ...resourceData,
          filePath: uploadResult.filePath,
          mimeType: uploadResult.mimeType,
          fileSize: uploadResult.fileSize,
        };
        toast.success('Archivo subido exitosamente.');
      } catch (uploadError: any) {
        toast.error(uploadError.message);
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    } else {
      resourceData.url = newResourceUrl;
    }

    try {
      const res = await fetch(`/api/profesor/courses/${courseId}/modules/${moduleId}/classes/${classId}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resourceData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al añadir el recurso');
      }

      toast.success('Recurso añadido exitosamente.');
      setNewResourceName('');
      setNewResourceUrl('');
      setNewResourceType('');
      setSelectedFile(null);
      fetchResources(); // Refrescar la lista de recursos
    } catch (err: any) {
      setFetchError(err.message);
      toast.error(err.message);
    }
  };

  const handleEditResource = async (resourceId: string) => {
    if (!editingResourceName.trim() || !editingResourceType.trim()) {
      toast.error('El nombre y el tipo del recurso son obligatorios.');
      return;
    }

    if (!editingResourceUrl.trim() && !editingSelectedFile && !editingFilePath) {
      toast.error('Debes proporcionar una URL o subir un archivo.');
      return;
    }

    if (editingResourceUrl.trim() && editingSelectedFile) {
      toast.error('No puedes proporcionar una URL y subir un archivo al mismo tiempo.');
      return;
    }

    let resourceData: any = {
      nombre: editingResourceName,
      tipo: editingResourceType,
    };

    if (editingSelectedFile) {
      setEditingUploading(true);
      const formData = new FormData();
      formData.append('file', editingSelectedFile);

      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.message || 'Error al subir el archivo');
        }

        const uploadResult = await uploadRes.json();
        resourceData = {
          ...resourceData,
          filePath: uploadResult.filePath,
          mimeType: uploadResult.mimeType,
          fileSize: uploadResult.fileSize,
          url: null, // Si se sube un archivo, la URL debe ser nula
        };
        toast.success('Archivo subido exitosamente.');
      } catch (uploadError: any) {
        toast.error(uploadError.message);
        setEditingUploading(false);
        return;
      } finally {
        setEditingUploading(false);
      }
    } else if (editingResourceUrl.trim()) {
      resourceData.url = editingResourceUrl;
      resourceData.filePath = null; // Si se usa URL, el filePath debe ser nulo
      resourceData.mimeType = null;
      resourceData.fileSize = null;
    } else if (editingFilePath) {
      resourceData.filePath = editingFilePath;
      resourceData.mimeType = editingMimeType;
      resourceData.fileSize = editingFileSize;
      resourceData.url = null;
    }

    try {
      const res = await fetch(`/api/profesor/courses/${courseId}/modules/${moduleId}/classes/${classId}/resources/${resourceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resourceData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al actualizar el recurso');
      }

      toast.success('Recurso actualizado exitosamente.');
      setEditingResourceId(null);
      setEditingResourceName('');
      setEditingResourceUrl('');
      setEditingResourceType('');
      setEditingFilePath('');
      setEditingMimeType('');
      setEditingFileSize(undefined);
      setEditingSelectedFile(null);
      fetchResources(); // Refrescar la lista de recursos
    } catch (err: any) {
      setFetchError(err.message);
      toast.error(err.message);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este recurso?')) {
      return;
    }

    try {
      const res = await fetch(`/api/profesor/courses/${courseId}/modules/${moduleId}/classes/${classId}/resources/${resourceId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al eliminar el recurso');
      }
      
      toast.success('Recurso eliminado exitosamente.');
      fetchResources(); // Refrescar la lista de recursos

    } catch (err: any) {
      setFetchError(err.message);
      toast.error(err.message);
    }
  };

  const startEditing = (resource: Resource) => {
    setEditingResourceId(resource.id);
    setEditingResourceName(resource.nombre);
    setEditingResourceUrl(resource.url || '');
    setEditingResourceType(resource.tipo);
    setEditingFilePath(resource.filePath || '');
    setEditingMimeType(resource.mimeType || '');
    setEditingFileSize(resource.fileSize || undefined);
    setEditingSelectedFile(null); // Reset file input
  };

  const cancelEditing = () => {
    setEditingResourceId(null);
    setEditingResourceName('');
    setEditingResourceUrl('');
    setEditingResourceType('');
    setEditingFilePath('');
    setEditingMimeType('');
    setEditingFileSize(undefined);
    setEditingSelectedFile(null);
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Cargando recursos...</div>;
  }

  if (fetchError) {
    return <div className="container mx-auto p-4 text-red-500 text-center">{fetchError}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Gestión de Recursos para la Clase: {classTitle}
      </h1>
      <Link href={`/profesor/courses/edit/${courseId}/modules/${moduleId}/classes?courseTitle=${encodeURIComponent(courseTitle)}&moduleTitle=${encodeURIComponent(moduleTitle)}`} className="text-blue-500 hover:underline mb-4 block">
        &larr; Volver a la gestión de clases
      </Link>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Añadir Nuevo Recurso</h2>
        <form onSubmit={handleAddResource} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newResourceName">
              Nombre del Recurso
            </label>
            <input
              type="text"
              id="newResourceName"
              placeholder="Nombre del Recurso"
              value={newResourceName}
              onChange={(e) => setNewResourceName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newResourceType">
              Tipo de Recurso (ej. PDF, Video, Enlace)
            </label>
            <input
              type="text"
              id="newResourceType"
              placeholder="Tipo de Recurso"
              value={newResourceType}
              onChange={(e) => setNewResourceType(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <p className="block text-gray-700 text-sm font-bold mb-2">Selecciona el origen del recurso:</p>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newResourceUrl">
                URL del Recurso (para enlaces externos como YouTube, Vimeo)
              </label>
              <input
                type="url"
                id="newResourceUrl"
                placeholder="URL del Recurso"
                value={newResourceUrl}
                onChange={(e) => {
                  setNewResourceUrl(e.target.value);
                  if (e.target.value) setSelectedFile(null); // Clear file if URL is entered
                }}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                disabled={!!selectedFile}
              />
            </div>
            <p className="text-center text-gray-500 mb-2">O</p>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newResourceFile">
                Subir Archivo (para videos, PDFs, imágenes, etc.)
              </label>
              <input
                type="file"
                id="newResourceFile"
                onChange={(e) => {
                  setSelectedFile(e.target.files ? e.target.files[0] : null);
                  if (e.target.files?.[0]) setNewResourceUrl(''); // Clear URL if file is selected
                }}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                disabled={!!newResourceUrl.trim()}
                accept="video/*,image/*,application/pdf"
              />
              {selectedFile && <p className="text-gray-600 text-sm mt-1">Archivo seleccionado: {selectedFile.name}</p>}
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={uploading}
          >
            {uploading ? 'Subiendo archivo...' : 'Añadir Recurso'}
          </button>
        </form>
      </div>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Recursos Existentes</h2>
        {resources.length === 0 ? (
          <p>No hay recursos creados para esta clase aún.</p>
        ) : (
          <ul>
            {resources.map((resource) => (
              <li key={resource.id} className="flex justify-between items-center bg-gray-100 p-3 rounded mb-2">
                {editingResourceId === resource.id ? (
                  <div className="flex-grow mr-2 space-y-2">
                    <input
                      type="text"
                      value={editingResourceName}
                      onChange={(e) => setEditingResourceName(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    <input
                      type="text"
                      value={editingResourceType}
                      onChange={(e) => setEditingResourceType(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    <div className="border-t pt-2 mt-2">
                      <p className="block text-gray-700 text-sm font-bold mb-2">Origen del recurso:</p>
                      {editingFilePath ? (
                        <p className="text-gray-600 text-sm mb-2">Archivo actual: <a href={editingFilePath} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{editingFilePath.split('/').pop()}</a></p>
                      ) : (
                        <input
                          type="url"
                          value={editingResourceUrl}
                          onChange={(e) => {
                            setEditingResourceUrl(e.target.value);
                            if (e.target.value) setEditingSelectedFile(null);
                          }}
                          className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          disabled={!!editingSelectedFile}
                        />
                      )}
                      <p className="text-center text-gray-500 my-2">O</p>
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="editingResourceFile">
                          Subir Nuevo Archivo
                        </label>
                        <input
                          type="file"
                          id="editingResourceFile"
                          onChange={(e) => {
                            setEditingSelectedFile(e.target.files ? e.target.files[0] : null);
                            if (e.target.files?.[0]) setEditingResourceUrl('');
                          }}
                          className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          disabled={!!editingResourceUrl.trim()}
                        />
                        {editingSelectedFile && <p className="text-gray-600 text-sm mt-1">Archivo seleccionado: {editingSelectedFile.name}</p>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-800">
                    <span className="font-bold text-lg">{resource.nombre}</span> ({resource.tipo}) -{' '}
                    {resource.url ? (
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {resource.url}
                      </a>
                    ) : resource.filePath ? (
                      <a href={resource.filePath} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {resource.filePath.split('/').pop()} ({resource.mimeType}, {resource.fileSize ? (resource.fileSize / 1024).toFixed(2) + ' KB' : 'N/A'})
                      </a>
                    ) : (
                      'Sin URL ni archivo'
                    )}
                  </span>
                )}
                <div>
                  {editingResourceId === resource.id ? (
                    <>
                      <button
                        onClick={() => handleEditResource(resource.id)}
                        className="bg-green-500 hover:bg-green-700 text-white text-sm font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline ml-2"
                        disabled={editingUploading}
                      >
                        {editingUploading ? 'Subiendo...' : 'Guardar'}
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="bg-gray-500 hover:bg-gray-700 text-white text-sm font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline ml-2"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(resource)}
                        className="bg-yellow-500 hover:bg-yellow-700 text-white text-sm font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline ml-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteResource(resource.id)}
                        className="bg-red-500 hover:bg-red-700 text-white text-sm font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline ml-2"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
