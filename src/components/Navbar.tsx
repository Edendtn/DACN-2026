import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, UserCircle, Languages } from 'lucide-react';
import { cn } from '../lib/utils';

export const Navbar = () => {
  const location = useLocation();

  const navLinks = [
    { name: 'Projects', path: '/' },
    { name: 'Market', path: '/market' },
    { name: 'Technical Library', path: '/library' },
    { name: 'B2B Connection', path: '/connection' },
    { name: 'Admin', path: '/admin' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-[0px_4px_20px_rgba(24,28,30,0.04)] border-b border-slate-100">
      <div className="flex justify-between items-center px-8 py-4 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex flex-col leading-none group">
            <span className="text-2xl font-black tracking-tighter text-red-600 font-headline">DACN</span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-slate-600 uppercase">Việt Nam Phát Triển</span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-6 font-headline font-semibold text-sm tracking-tight">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "transition-all duration-300 pb-1 border-b-2",
                  location.pathname === link.path 
                    ? "text-red-600 border-red-600" 
                    : "text-slate-500 border-transparent hover:text-red-600"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-[#f1f4f6] rounded-full px-4 py-1.5">
            <Search className="text-slate-500 w-4 h-4" />
            <input 
              className="bg-transparent border-none focus:ring-0 text-xs w-48 placeholder:text-slate-400" 
              placeholder="Tìm kiếm dự án..." 
              type="text"
            />
          </div>
          <button className="text-red-600 font-semibold text-sm hover:bg-slate-100 px-4 py-2 rounded-xl transition-all">Login</button>
          <button className="bg-red-600 text-white px-6 py-2 rounded-full font-semibold text-sm shadow-md hover:bg-red-700 active:scale-95 duration-200">Register</button>
          <div className="flex items-center gap-2 ml-2">
            <Languages className="text-slate-500 w-5 h-5 cursor-pointer hover:text-red-600" />
            <UserCircle className="text-slate-500 w-5 h-5 cursor-pointer hover:text-red-600" />
          </div>
        </div>
      </div>
    </nav>
  );
};
