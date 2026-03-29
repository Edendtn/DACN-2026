import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calculator, Zap, Leaf, FileText, Search, ArrowRight, ExternalLink } from 'lucide-react';
import { MOCK_ARTICLES } from '../data';
import { cn } from '../lib/utils';

export const TechnicalLibraryPage = () => {
  const [activeTab, setActiveTab] = useState<'tools' | 'insights'>('insights');

  return (
    <div className="pt-24 pb-24 bg-[#f7fafc]">
      <div className="max-w-[1440px] mx-auto px-8">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-red-600 font-bold text-sm tracking-widest uppercase">Thư viện Kỹ thuật & ESG</span>
          <h1 className="text-5xl font-extrabold text-slate-900 mt-4 tracking-tighter font-headline">The Technical Curator</h1>
          <p className="text-slate-500 mt-6 text-lg leading-relaxed">
            Nơi lưu trữ kiến thức chuyên sâu, công cụ tính toán và các báo cáo ESG hàng đầu cho ngành xử lý nước và hạ tầng công nghiệp.
          </p>
        </header>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-16">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex gap-1">
            <button 
              onClick={() => setActiveTab('insights')}
              className={cn(
                "px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
                activeTab === 'insights' ? "bg-red-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <BookOpen className="w-4 h-4" /> Translation & Insights
            </button>
            <button 
              onClick={() => setActiveTab('tools')}
              className={cn(
                "px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
                activeTab === 'tools' ? "bg-red-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <Calculator className="w-4 h-4" /> Technical Tools
            </button>
          </div>
        </div>

        {activeTab === 'insights' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Featured Article */}
            <div className="lg:col-span-8">
              <motion.article 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group cursor-pointer"
              >
                <div className="relative h-[500px] rounded-[3rem] overflow-hidden mb-8 shadow-2xl">
                  <img src={MOCK_ARTICLES[0].image} alt={MOCK_ARTICLES[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-12 left-12 right-12">
                    <span className="bg-red-100 text-red-600 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 inline-block">
                      {MOCK_ARTICLES[0].category}
                    </span>
                    <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tighter font-headline mb-4">
                      {MOCK_ARTICLES[0].title}
                    </h2>
                    <p className="text-[#d6e3ff] text-lg opacity-80 line-clamp-2 max-w-2xl">
                      {MOCK_ARTICLES[0].excerpt}
                    </p>
                  </div>
                </div>
              </motion.article>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {MOCK_ARTICLES.slice(1).map(article => (
                  <article key={article.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 group hover:shadow-xl transition-all">
                    <div className="h-48 rounded-2xl overflow-hidden mb-6">
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <span className="text-[#0a6c44] font-bold text-[10px] uppercase tracking-widest mb-2 block">{article.category}</span>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 font-headline group-hover:text-red-600 transition-colors">{article.title}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-6">{article.excerpt}</p>
                    <button className="flex items-center gap-2 text-red-600 font-bold text-sm hover:gap-3 transition-all">
                      Đọc tiếp <ArrowRight className="w-4 h-4" />
                    </button>
                  </article>
                ))}
              </div>
            </div>

            {/* Sidebar: Categories & Search */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="relative mb-8">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    className="w-full bg-[#f1f4f6] border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-red-600/20" 
                    placeholder="Tìm kiếm bài viết..." 
                  />
                </div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Chuyên mục phổ biến</h4>
                <div className="space-y-3">
                  {['Chiến lược ESG', 'Báo cáo Carbon', 'Công nghệ lọc màng', 'FDI Insights', 'Vật liệu chống thấm'].map(cat => (
                    <button key={cat} className="w-full flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 text-sm font-semibold text-slate-600 hover:text-red-600 transition-all">
                      {cat} <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-600 to-red-900 p-8 rounded-[2rem] text-white shadow-xl">
                <Leaf className="w-10 h-10 mb-6 text-red-100" />
                <h4 className="text-xl font-bold mb-2 font-headline">ESG Insights</h4>
                <p className="text-sm opacity-80 mb-6">Đăng ký nhận bản tin chuyên sâu về phát triển bền vững và giảm thiểu carbon.</p>
                <input className="w-full bg-white/10 border-none rounded-xl py-3 px-4 mb-3 text-sm placeholder:text-white/40" placeholder="Email của bạn" />
                <button className="w-full bg-white text-red-600 font-bold py-3 rounded-xl hover:shadow-lg transition-all">Đăng ký ngay</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Technical Tools Widgets */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:-translate-y-2 transition-all duration-500">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 font-headline">Tính định mức xử lý nước</h3>
              <p className="text-slate-500 text-sm mb-8">Công cụ hỗ trợ tính toán lưu lượng và liều lượng hóa chất tối ưu cho hệ thống WTP/ETP.</p>
              <button className="w-full py-4 bg-[#f1f4f6] text-red-600 font-bold rounded-2xl hover:bg-red-600 hover:text-white transition-all">Mở công cụ</button>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:-translate-y-2 transition-all duration-500">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 font-headline">Tra cứu vật liệu Mapei/Sika</h3>
              <p className="text-slate-500 text-sm mb-8">Thư viện tra cứu thông số kỹ thuật (TDS) và an toàn (MSDS) cho các loại sàn tự san phẳng.</p>
              <button className="w-full py-4 bg-[#f1f4f6] text-red-600 font-bold rounded-2xl hover:bg-red-600 hover:text-white transition-all">Tra cứu ngay</button>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:-translate-y-2 transition-all duration-500">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                <ExternalLink className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 font-headline">Báo cáo dấu chân Carbon</h3>
              <p className="text-slate-500 text-sm mb-8">Công cụ ước tính phát thải carbon cho các dự án hạ tầng và nhà máy sản xuất.</p>
              <button className="w-full py-4 bg-[#f1f4f6] text-red-600 font-bold rounded-2xl hover:bg-red-600 hover:text-white transition-all">Bắt đầu tính</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
