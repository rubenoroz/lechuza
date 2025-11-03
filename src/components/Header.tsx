import TopBar from './TopBar';
import Logo from './Logo';
import MainMenu from './MainMenu';

const Header = () => {
  return (
    <header className="bg-white shadow-md relative z-20 h-24 overflow-visible">
      <TopBar />
      <div className="container mx-auto px-4 py-0 flex justify-between items-center">
        <Logo />
        <div className="flex items-center justify-end">
          <MainMenu />
        </div>
        <div className="md:hidden ml-4">
          {/* Mobile menu button */}
          <button className="text-gray-600 hover:text-gray-800 focus:outline-none">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;