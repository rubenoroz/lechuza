import Link from 'next/link';

const MainMenu = () => {
  return (
    <nav className="hidden md:flex space-x-4 mt-[-10px]">
      <Link href="/" className="text-gray-600 hover:text-gray-800">Inicio</Link>
      <Link href="/courses" className="text-gray-600 hover:text-gray-800">Cursos</Link>
      <Link href="/about" className="text-gray-600 hover:text-gray-800">Nosotros</Link>
      <Link href="/teachers" className="text-gray-600 hover:text-gray-800">Profesores</Link>
      <Link href="/faq" className="text-gray-600 hover:text-gray-800">FAQ</Link>
      <Link href="/contact" className="text-gray-600 hover:text-gray-800">Contacto</Link>
    </nav>
  );
};

export default MainMenu;
