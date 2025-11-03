const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Lechuza</h3>
            <p className="text-gray-400">Aprende a tu propio ritmo.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-white">Inicio</a></li>
              <li><a href="/courses" className="text-gray-400 hover:text-white">Cursos</a></li>
              <li><a href="/about" className="text-gray-400 hover:text-white">Nosotros</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contacto</h3>
            <p className="text-gray-400">Guadalajara, Jalisco, México</p>
            <p className="text-gray-400">info@lechuza.com</p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-gray-400">
          &copy; {new Date().getFullYear()} Lechuza. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
