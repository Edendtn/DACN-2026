import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-[#f1f4f6] border-t border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-12 py-16 max-w-[1440px] mx-auto">
        <div className="space-y-4">
          <Link to="/" className="flex flex-col leading-none group">
            <span className="text-2xl font-black tracking-tighter text-red-600 font-headline">DACN</span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-slate-600 uppercase">Việt Nam Phát Triển</span>
          </Link>
          <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
            Nền tảng kết nối kỹ thuật và thương mại hàng đầu cho ngành công nghiệp và xử lý nước tại Việt Nam.
          </p>
        </div>
        
        <div>
          <h4 className="font-headline text-xs uppercase tracking-widest text-slate-500 font-bold mb-6">Đối tác Chiến lược</h4>
          <ul className="space-y-4 font-body text-xs uppercase tracking-widest">
            <li><a className="text-slate-400 hover:text-red-600 transition-all" href="#">VSIP</a></li>
            <li><a className="text-slate-400 hover:text-red-600 transition-all" href="#">Becamex</a></li>
            <li><a className="text-slate-400 hover:text-red-600 transition-all" href="#">Novaland</a></li>
            <li><a className="text-slate-400 hover:text-red-600 transition-all" href="#">IDICO</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-headline text-xs uppercase tracking-widest text-slate-500 font-bold mb-6">Liên kết Nhanh</h4>
          <ul className="space-y-4 font-body text-xs uppercase tracking-widest">
            <li><a className="text-slate-400 hover:text-red-600 transition-all" href="#">Marketplace</a></li>
            <li><a className="text-slate-400 hover:text-red-600 transition-all" href="#">Project Feed</a></li>
            <li><a className="text-slate-400 hover:text-red-600 transition-all" href="#">Technical Library</a></li>
            <li><a className="text-slate-400 hover:text-red-600 transition-all" href="#">B2B Connection</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-headline text-xs uppercase tracking-widest text-slate-500 font-bold mb-6">Pháp lý</h4>
          <ul className="space-y-4 font-body text-xs uppercase tracking-widest">
            <li><a className="text-slate-400 hover:text-red-600 transition-all" href="#">Privacy Policy</a></li>
            <li><a className="text-slate-400 hover:text-red-600 transition-all" href="#">Terms of Service</a></li>
            <li><a className="text-slate-400 hover:text-red-600 transition-all" href="#">ESG Compliance</a></li>
            <li><a className="text-slate-400 hover:text-red-600 transition-all" href="#">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="px-12 py-6 border-t border-slate-200/50">
        <p className="font-body text-[10px] uppercase tracking-widest text-slate-500 text-center">
          © 2024 Industrial & Water Treatment Portal. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
