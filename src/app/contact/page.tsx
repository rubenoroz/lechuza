export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 py-16 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase font-inter">Contacto</h2>
          <p className="mt-2 text-4xl leading-tight font-extrabold tracking-tight text-gray-900 sm:text-5xl font-playfair-display">
            Ponte en contacto con nosotros
          </p>
          <p className="mt-4 text-xl text-gray-600 font-inter">
            ¿Tienes alguna pregunta o quieres saber más? Envíanos un mensaje.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Sección de Información de Contacto */}
          <div className="flex flex-col justify-center p-8 bg-white rounded-lg shadow-xl">
            <h3 className="text-3xl font-extrabold text-gray-900 mb-6 font-playfair-display">Nuestra Información</h3>
            <p className="text-lg text-gray-700 mb-3 font-inter">
              <strong className="text-gray-900">Ubicación:</strong> Guadalajara, Jalisco, México
            </p>
            <p className="text-lg text-gray-700 mb-3 font-inter">
              <strong className="text-gray-900">Email:</strong> info@lechuza.com
            </p>
            <p className="text-lg text-gray-700 mb-3 font-inter">
              <strong className="text-gray-900">Teléfono:</strong> +52 33 1234 5678
            </p>
            <div className="mt-8">
              {/* Puedes añadir iconos de redes sociales aquí */}
            </div>
          </div>

          {/* Sección del Formulario de Contacto */}
          <div className="p-8 bg-white rounded-lg shadow-xl">
            <form action="https://formspree.io/f/xyzblyrr" method="POST" className="space-y-7">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 font-inter">Nombre Completo</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-200 ease-in-out hover:border-blue-400 font-inter"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 font-inter">Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-200 ease-in-out hover:border-blue-400 font-inter"
                  placeholder="tu.email@ejemplo.com"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 font-inter">Asunto</label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-200 ease-in-out hover:border-blue-400 font-inter"
                  placeholder="Asunto de tu mensaje"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 font-inter">Mensaje</label>
                <textarea
                  name="message"
                  id="message"
                  rows={6}
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-200 ease-in-out hover:border-blue-400 font-inter"
                  placeholder="Escribe tu mensaje aquí..."
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-lg transition duration-200 ease-in-out transform hover:scale-105 font-inter"
                >
                  Enviar Mensaje
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
