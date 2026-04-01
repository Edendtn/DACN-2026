import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, MapPin, Building2, TrendingUp, Anchor, Plane, Navigation, Star, ArrowRight, ArrowLeft, Droplets, Search, Factory, Building, Hotel, GraduationCap, Briefcase, HardHat, Loader2 } from 'lucide-react';
import { MOCK_PROJECTS } from '../data';
import { Project } from '../types';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { fetchProjectsFromSheet, SheetProject } from '../services/sheetService';

const CATEGORY_ICONS: Record<string, any> = {
  FACTORY: Factory,
  BUILDING: Building,
  RESORT: Hotel,
  HOTEL: Hotel,
  SCHOOL: GraduationCap,
};

import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-error-handler';

export const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFromFirestore, setIsFromFirestore] = useState(false);
  const [isFromSheet, setIsFromSheet] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [filters, setFilters] = useState({
    province: 'All',
    stage: 'All',
    sector: 'All',
    capitalType: 'All',
  });

  useEffect(() => {
    setLoading(true);
    
    // Try Firestore first
    const q = query(collection(db, 'projects'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const firestoreProjects = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];
        setProjects(firestoreProjects);
        setIsFromFirestore(true);
        setIsFromSheet(false);
        setLoading(false);
      } else {
        // Fallback to Google Sheet if Firestore is empty
        loadFromSheet();
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'projects');
      loadFromSheet();
    });

    const loadFromSheet = async () => {
      try {
        const sheetData = await fetchProjectsFromSheet();
        if (sheetData && sheetData.length > 0) {
          const mappedProjects: Project[] = sheetData.map(sp => ({
            id: sp.id,
            name: sp.name,
            location: sp.location,
            province: sp.province,
            investmentCapital: sp.investmentCapital,
            constructionType: sp.category,
            scale: sp.scale,
            startDate: '',
            completionDate: sp.completionDate,
            stage: (sp.stage as any) || 'Construction',
            sector: (sp.sector as any) || 'Industrial',
            investor: {
              name: sp.investor,
              address: sp.investorAddress,
              representative: sp.investorRepresentative
            },
            mainContractor: {
              name: sp.mainContractor,
              address: sp.mainContractorAddress,
              representative: sp.mainContractorRepresentative
            },
            capitalType: sp.capitalType,
            investmentType: sp.category,
            distanceToPort: parseFloat(sp.distanceToPort) || 0,
            distanceToAirport: parseFloat(sp.distanceToAirport) || 0,
            distanceToHighway: parseFloat(sp.distanceToHighway) || 0,
            image: sp.image,
            category: sp.category,
            description: sp.description,
          }));
          setProjects(mappedProjects);
          setIsFromSheet(true);
          setIsFromFirestore(false);
        } else {
          setProjects(MOCK_PROJECTS);
        }
      } catch (err) {
        console.error("Sheet error:", err);
        setProjects(MOCK_PROJECTS);
      } finally {
        setLoading(false);
      }
    };

    return () => unsubscribe();
  }, []);

  const provinces = useMemo(() => ['All', ...new Set(projects.map(p => p.province).filter(Boolean))], [projects]);
  const stages = useMemo(() => ['All', ...new Set(projects.map(p => p.stage).filter(Boolean))], [projects]);
  const sectors = useMemo(() => ['All', ...new Set(projects.map(p => p.sector).filter(Boolean))], [projects]);
  const capitalTypes = ['All', 'FDI', 'DDI'];

  const filteredProjects = useMemo(() => {
    const filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           project.investor.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProvince = filters.province === 'All' || project.province === filters.province;
      const matchesStage = filters.stage === 'All' || project.stage === filters.stage;
      const matchesSector = filters.sector === 'All' || project.sector === filters.sector;
      const matchesCapital = filters.capitalType === 'All' || project.capitalType.includes(filters.capitalType);
      
      return matchesSearch && matchesProvince && matchesStage && matchesSector && matchesCapital;
    });
    return filtered;
  }, [searchTerm, filters, projects]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
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
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-headline">
                  Danh sách dự án 
                  {isFromFirestore && <span className="ml-2 text-xs font-normal bg-blue-100 text-blue-800 px-3 py-1 rounded-full align-middle">Dữ liệu Firestore</span>}
                  {isFromSheet && <span className="ml-2 text-xs font-normal bg-green-100 text-green-800 px-3 py-1 rounded-full align-middle">Dữ liệu từ Sheet</span>}
                </h2>
                <p className="text-slate-500 font-medium mt-1">Tìm thấy {filteredProjects.length} dự án phù hợp</p>
                {!isFromSheet && !loading && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                    <p className="text-amber-800 text-xs font-bold uppercase tracking-widest">
                      ⚠️ Đang hiển thị dữ liệu mẫu. Không thể kết nối với Google Sheet.
                    </p>
                    <button 
                      onClick={() => {
                        localStorage.removeItem('sheet_projects_cache');
                        window.location.reload();
                      }}
                      className="text-amber-900 text-[10px] font-black uppercase tracking-widest hover:underline"
                    >
                      Thử tải lại
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    localStorage.removeItem('sheet_projects_cache');
                    window.location.reload();
                  }}
                  title="Làm mới dữ liệu"
                  className="p-2 bg-white border border-slate-100 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <Loader2 className={cn("w-4 h-4 text-slate-400", loading && "animate-spin")} />
                </button>
                <button className="p-2 bg-white border border-slate-100 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"><Navigation className="w-4 h-4 text-slate-400" /></button>
                <button className="p-2 bg-white border border-slate-100 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"><Star className="w-4 h-4 text-slate-400" /></button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100">
                  <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu dự án...</p>
                </div>
              ) : paginatedProjects.length > 0 ? (
                <>
                  <AnimatePresence mode="popLayout">
                    {paginatedProjects.map((project) => {
                    const Icon = CATEGORY_ICONS[project.category] || Factory;
                    const hasValidImage = project.image && project.image.startsWith('http') && !project.image.includes('picsum.photos/seed');
                    
                    return (
                      <motion.div
                        layout
                        key={project.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Link to={`/project/${project.id}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md hover:border-red-200 transition-all duration-200">
                          <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                            {/* Left: Thumbnail (Optional) & Title */}
                            <div className="flex flex-grow min-w-0 items-center gap-4">
                              {hasValidImage && (
                                <div className="hidden sm:block w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                                  <img 
                                    src={project.image} 
                                    alt="" 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              )}
                              <div className="min-w-0 flex-grow">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <div className="bg-red-50 p-1.5 rounded-lg text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="flex gap-1.5">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider">
                                      {project.province}
                                    </span>
                                    <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider">
                                      {project.stage}
                                    </span>
                                  </div>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 leading-tight group-hover:text-red-600 transition-colors font-headline truncate">
                                  {project.name}
                                </h3>
                                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-medium mt-1">
                                  <MapPin className="w-3 h-3 text-red-500" />
                                  <span className="truncate">{project.location}</span>
                                </div>
                              </div>
                            </div>

                            {/* Middle: Key Stats (More compact) */}
                            <div className="grid grid-cols-3 gap-4 md:gap-8 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
                              <div className="text-center md:text-left">
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Vốn đầu tư</p>
                                <p className="text-xs font-extrabold text-red-600 font-mono">${project.investmentCapital}M</p>
                              </div>
                              <div className="text-center md:text-left">
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Quy mô</p>
                                <p className="text-xs font-extrabold text-slate-700 font-mono">{project.scale}</p>
                              </div>
                              <div className="text-center md:text-left">
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Hoàn thành</p>
                                <p className="text-xs font-extrabold text-slate-700 font-mono">{project.completionDate}</p>
                              </div>
                            </div>

                            {/* Right: Action */}
                            <div className="hidden md:flex shrink-0">
                              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                  </AnimatePresence>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum = currentPage;
                          if (currentPage <= 3) pageNum = i + 1;
                          else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                          else pageNum = currentPage - 2 + i;
                          
                          if (pageNum <= 0 || pageNum > totalPages) return null;

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={cn(
                                "w-10 h-10 rounded-xl text-xs font-bold transition-all",
                                currentPage === pageNum 
                                  ? "bg-red-600 text-white shadow-lg shadow-red-900/20" 
                                  : "bg-white border border-slate-100 text-slate-600 hover:bg-slate-50"
                              )}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      
                      <span className="ml-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Trang {currentPage} / {totalPages}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100">
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Không tìm thấy dự án nào phù hợp.</p>
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setFilters({ province: 'All', stage: 'All', sector: 'All', capitalType: 'All' });
                    }}
                    className="mt-4 text-red-600 font-bold uppercase tracking-widest text-[10px] hover:underline"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
