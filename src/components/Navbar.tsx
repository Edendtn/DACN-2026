import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, UserCircle, Languages, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

export const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = [
    { name: 'Dự án', path: '/' },
    { name: 'Tin tức', path: '/news' },
    { name: 'Blog học thuật', path: '/blog' },
    { name: 'Công cụ kỹ thuật', path: '/tools' },
    { name: 'Kết nối B2B', path: '/market' },
    { name: 'Admin', path: '/admin', adminOnly: true },
  ];

  const isAdmin = user?.email === "doantrungnghiavt@gmail.com";

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-[0px_4px_20px_rgba(24,28,30,0.04)] border-b border-slate-100">
      <div className="flex justify-between items-center px-8 py-4 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex flex-col leading-none group">
            <span className="text-2xl font-black tracking-tighter text-red-600 font-headline">DACN</span>
            <span className="text-[5px] font-bold tracking-[0.2em] text-slate-600 uppercase">Việt Nam Phát Triển</span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-6 font-headline font-semibold text-sm tracking-tight">
            {navLinks.map((link) => {
              if (link.adminOnly && !isAdmin) return null;
              return (
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
              );
            })}
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
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-900 leading-none">{user.displayName}</span>
                <span className="text-[8px] text-slate-500 font-medium">{user.email}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-500 hover:text-red-600"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={handleLogin}
                className="text-red-600 font-semibold text-sm hover:bg-slate-100 px-4 py-2 rounded-xl transition-all"
              >
                Login
              </button>
              <button 
                onClick={handleLogin}
                className="bg-red-600 text-white px-6 py-2 rounded-full font-semibold text-sm shadow-md hover:bg-red-700 active:scale-95 duration-200"
              >
                Register
              </button>
            </>
          )}
          <div className="flex items-center gap-2 ml-2">
            <Languages className="text-slate-500 w-5 h-5 cursor-pointer hover:text-red-600" />
            <UserCircle className="text-slate-500 w-5 h-5 cursor-pointer hover:text-red-600" />
          </div>
        </div>
      </div>
    </nav>
  );
};
