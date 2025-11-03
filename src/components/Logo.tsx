import Link from 'next/link';

const Logo = () => {
  return (
    <div className="relative flex items-center left-[-35px]">
      <Link href="/">
        <img src="/images/logo.svg" alt="Lechuza Logo" className="h-30 z-10 top-[-80px] -translate-y-[20px]" />
      </Link>
    </div>
  );
};

export default Logo;
