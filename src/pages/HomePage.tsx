import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, MapPin, Building2, TrendingUp, Anchor, Plane, Navigation, Star, ArrowRight, Droplets, Search, Factory, Building, Hotel, GraduationCap, Briefcase, HardHat } from 'lucide-react';
import { MOCK_PROJECTS } from '../data';
import { Project } from '../types';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const CATEGORY_ICONS: Record<string, any> = {
  FACTORY: Factory,
  BUILDING: Building,
  RESORT: Hotel,
  HOTEL: Hotel,
  SCHOOL: GraduationCap,
};

export const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    province: 'All',
    stage: 'All',
    sector: 'All',
    capitalType: 'All',
  });

  const provinces = useMemo(() => ['All', ...new Set(MOCK_PROJECTS.map(p => p.province))], []);
  const stages = ['All', 'Concept', 'Design & Documentation', 'Pre-construction', 'Construction'];
  const sectors = ['All', 'Utilities', 'Industrial', 'Energy', 'Infrastructure', 'Building', 'Resort'];
  const capitalTypes = ['All', 'FDI', 'DDI'];

  const filteredProjects = useMemo(() => {
    return MOCK_PROJECTS.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           project.investor.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProvince = filters.province === 'All' || project.province === filters.province;
      const matchesStage = filters.stage === 'All' || project.stage === filters.stage;
      const matchesSector = filters.sector === 'All' || project.sector === filters.sector;
      const matchesCapital = filters.capitalType === 'All' || project.capitalType.includes(filters.capitalType);
      
      return matchesSearch && matchesProvince && matchesStage && matchesSector && matchesCapital;
    });
  }, [searchTerm, filters]);

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white border-b border-slate-100">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#dc2626_1px,transparent_1px)] [background-size:40px_40px]"></div>
        </div>
        
        <div className="max-w-[1440px] mx-auto px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
            >
              <TrendingUp className="w-3 h-3" />
              Cơ sở dữ liệu dự án thời gian thực
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8 font-headline"
            >
              Hệ thống Quản lý <br />
              <span className="text-red-600">Dự án Công nghiệp</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-600 text-medium max-w-xl mb-12"
            >
              Tra cứu thông tin chi tiết về các dự án xây dựng, nhà máy FDI và hạ tầng trọng điểm. Dữ liệu được cập nhật chính xác từ các nguồn tin cậy.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col md:flex-row gap-4 bg-slate-50 p-2 rounded-[2rem] border border-slate-200 shadow-sm"
            >
              <div className="flex-grow relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text"
                  placeholder="Tìm theo tên dự án, chủ đầu tư..."
                  className="w-full bg-transparent border-none text-slate-900 placeholder:text-slate-400 py-4 pl-14 pr-6 focus:ring-0 text-lg font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="bg-red-600 text-white hover:bg-red-700 px-10 py-4 rounded-[1.5rem] font-bold text-lg transition-all shadow-lg shadow-red-900/10">
                Tìm kiếm
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="lg:w-80 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 sticky top-24">
              <div className="flex items-center gap-2 mb-8">
                <Filter className="w-4 h-4 text-red-600" />
                <h3 className="font-bold text-red-600 uppercase tracking-widest text-xs">Bộ lọc thông minh</h3>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Trạng thái thầu</label>
                  <div className="space-y-2">
                    {stages.map(stage => (
                      <button
                        key={stage}
                        onClick={() => setFilters(f => ({ ...f, stage }))}
                        className={cn(
                          "w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all border",
                          filters.stage === stage 
                            ? "bg-red-600 text-white border-red-600" 
                            : "bg-white text-slate-600 border-slate-100 hover:border-slate-300"
                        )}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Ngành dọc (Sectors)</label>
                  <div className="space-y-2">
                    {sectors.map(sector => (
                      <button
                        key={sector}
                        onClick={() => setFilters(f => ({ ...f, sector }))}
                        className={cn(
                          "w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all border",
                          filters.sector === sector 
                            ? "bg-red-600 text-white border-red-600" 
                            : "bg-white text-slate-600 border-slate-100 hover:border-slate-300"
                        )}
                      >
                        {sector}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Tỉnh thành</label>
                  <select 
                    value={filters.province}
                    onChange={(e) => setFilters(f => ({ ...f, province: e.target.value }))}
                    className="w-full bg-slate-50 border-slate-100 rounded-xl py-2.5 px-4 text-xs font-bold text-red-600 focus:ring-red-600"
                  >
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Loại hình vốn</label>
                  <div className="flex gap-2">
                    {capitalTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => setFilters(f => ({ ...f, capitalType: type }))}
                        className={cn(
                          "flex-1 px-4 py-2.5 rounded-xl text-[10px] font-bold transition-all border uppercase tracking-widest",
                          filters.capitalType === type 
                            ? "bg-red-500 text-white border-red-500" 
                            : "bg-white text-slate-600 border-slate-100 hover:border-slate-300"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Project Grid */}
          <main className="flex-grow">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-headline">Danh sách dự án</h2>
                <p className="text-slate-500 font-medium mt-1">Tìm thấy {filteredProjects.length} dự án phù hợp</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-white border border-slate-100 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"><Navigation className="w-4 h-4 text-slate-400" /></button>
                <button className="p-2 bg-white border border-slate-100 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"><Star className="w-4 h-4 text-slate-400" /></button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project) => {
                  const Icon = CATEGORY_ICONS[project.category] || Factory;
                  return (
                    <motion.div
                      layout
                      key={project.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link to={`/project/${project.id}`} className="group block bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="relative h-64 overflow-hidden">
                          <img 
                            src={project.image} 
                            alt={project.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-6 left-6 flex gap-2">
                            <span className="bg-white/90 backdrop-blur-md text-red-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                              {project.province}
                            </span>
                            <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                              {project.capitalType.split(' - ')[0]}
                            </span>
                            <span className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                              {project.stage}
                            </span>
                          </div>
                          <div className="absolute bottom-6 right-6">
                            <div className="bg-red-600 p-3 rounded-2xl text-white shadow-lg">
                              <Icon className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-8">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-red-600 transition-colors font-headline line-clamp-2">
                              {project.name}
                            </h3>
                          </div>
                          
                          <div className="flex items-center gap-2 text-slate-500 text-xs mb-6 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-red-500" />
                            <span className="truncate">{project.location}</span>
                          </div>

                          <div className="grid grid-cols-3 gap-4 py-6 border-y border-slate-50 mb-6">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vốn đầu tư</p>
                              <p className="text-sm font-extrabold text-red-600 font-mono">${project.investmentCapital}M</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Quy mô</p>
                              <p className="text-sm font-extrabold text-red-600 font-mono">{project.scale}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hoàn thành</p>
                              <p className="text-sm font-extrabold text-red-600 font-mono">{project.completionDate}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <div className="flex items-center gap-1.5">
                              <Anchor className="w-3 h-3" /> Cảng: {project.distanceToPort}km
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Plane className="w-3 h-3" /> Sân bay: {project.distanceToAirport}km
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Navigation className="w-3 h-3" /> Cao tốc: {project.distanceToHighway}km
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
