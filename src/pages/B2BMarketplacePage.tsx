import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Package, FlaskConical, Search, MessageSquare, ArrowRight, Star, ShieldCheck } from 'lucide-react';
import { MOCK_PRODUCTS } from '../data';
import { cn } from '../lib/utils';

export const B2BMarketplacePage = () => {
  return (
    <div className="pt-24 pb-24 bg-[#f7fafc]">
      <div className="max-w-[1440px] mx-auto px-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <span className="text-red-600 font-bold text-sm tracking-widest uppercase">B2B Marketplace</span>
            <h1 className="text-5xl font-extrabold text-slate-900 mt-4 tracking-tighter font-headline">Kết Nối Giao Thương</h1>
            <p className="text-slate-500 mt-6 text-lg leading-relaxed">
              Danh bạ doanh nghiệp và gian hàng sản phẩm chuyên biệt cho ngành môi trường và hóa chất công nghiệp.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                className="w-64 md:w-80 bg-white border-none rounded-full py-3 pl-12 pr-4 text-sm shadow-sm focus:ring-2 focus:ring-red-600/20" 
                placeholder="Tìm sản phẩm, nhà cung cấp..." 
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar: Categories */}
          <aside className="lg:col-span-3 space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="font-headline font-bold text-slate-900 mb-6">Danh mục sản phẩm</h3>
              <div className="space-y-4">
                <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm">
                  <Package className="w-4 h-4" /> Thiết bị xử lý môi trường
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-500 font-semibold text-sm transition-all">
                  <FlaskConical className="w-4 h-4" /> Hóa chất công nghiệp
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-500 font-semibold text-sm transition-all">
                  <ShieldCheck className="w-4 h-4" /> Khác
                </button>
              </div>
            </div>

            <div className="bg-[#f1f4f6] p-8 rounded-[2rem] border border-slate-200">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Nhà cung cấp nổi bật</h4>
              <div className="space-y-4">
                {['Chemizol Group', 'Culligan', 'Fineamin', 'Toray'].map(brand => (
                  <div key={brand} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-red-600 text-xs shadow-sm">
                      {brand[0]}
                    </div>
                    <span className="text-sm font-bold text-slate-900">{brand}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-9">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {MOCK_PRODUCTS.map(product => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-slate-100 group hover:shadow-xl transition-all"
                >
                  <div className="relative h-56 rounded-[2rem] overflow-hidden mb-6">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current text-yellow-500" />
                      <span className="text-[10px] font-bold text-red-600">4.9</span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <span className="text-red-600 font-bold text-[10px] uppercase tracking-widest mb-2 block">{product.category}</span>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 font-headline line-clamp-1 group-hover:text-red-600 transition-colors">{product.name}</h3>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Nhà cung cấp</p>
                        <p className="text-sm font-bold text-slate-900">{product.supplier}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Giá</p>
                        <p className="text-sm font-bold text-red-600">{product.price}</p>
                      </div>
                    </div>
                    <button className="w-full py-3 bg-red-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Kết nối nhanh
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Add more mock products to fill the grid */}
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-slate-100 opacity-50 grayscale">
                  <div className="h-56 bg-slate-50 rounded-[2rem] mb-6 flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-slate-200" />
                  </div>
                  <div className="px-4 pb-4 space-y-3">
                    <div className="h-3 bg-slate-100 rounded-full w-24"></div>
                    <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                    <div className="h-3 bg-slate-100 rounded-full w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
