export default function AboutPage() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Quiénes Somos</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Nuestra Misión
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            En Lechuza, nuestra misión es proporcionar una educación de calidad, accesible y flexible para todos. Creemos en el poder del conocimiento para transformar vidas y estamos comprometidos a ayudar a nuestros estudiantes a alcanzar sus metas.
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-4">Nuestra Historia</h3>
              <p className="text-lg text-gray-500">
                Lechuza fue fundada en 2025 con la visión de crear una plataforma de aprendizaje en línea que fuera más que solo videos. Queríamos crear una comunidad de aprendizaje donde los estudiantes pudieran interactuar con los instructores y entre ellos, y donde pudieran obtener ayuda y apoyo en cada paso del camino.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-4">Nuestros Valores</h3>
              <ul className="list-disc list-inside text-lg text-gray-500 space-y-2">
                <li>Calidad: Nos esforzamos por ofrecer el contenido de la más alta calidad.</li>
                <li>Comunidad: Creemos en el poder de la comunidad para apoyar el aprendizaje.</li>
                <li>Accesibilidad: Hacemos que el aprendizaje sea accesible para todos.</li>
                <li>Innovación: Estamos constantemente innovando para mejorar la experiencia de aprendizaje.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
