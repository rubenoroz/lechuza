import Link from 'next/link';

const TopBar = () => {
  return (
    <div className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-1 flex justify-end items-center">
        <Link href="/login" className="text-sm text-gray-300 hover:text-white mr-4">Login</Link>
        <Link href="/register" className="text-sm text-gray-300 hover:text-white">Registro</Link>
      </div>
    </div>
  );
};

export default TopBar;
