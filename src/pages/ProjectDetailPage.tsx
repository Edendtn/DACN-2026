import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Building2, Calendar, DollarSign, Users, ChevronLeft, Download, Share2, Anchor, Plane, Navigation, Factory, Building, Hotel, GraduationCap, Briefcase, HardHat, Info, UserCircle, Map, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { MOCK_PROJECTS } from '../data';
import { cn } from '../lib/utils';

const CATEGORY_ICONS: Record<string, any> = {
  FACTORY: Factory,
  BUILDING: Building,
  RESORT: Hotel,
  HOTEL: Hotel,
  SCHOOL: GraduationCap,
};

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const project = MOCK_PROJECTS.find(p => p.id === id);
  const [activeTab, setActiveTab] = useState<'overview' | 'investor' | 'contractor' | 'consultant'>('overview');
  const [showSuccess, setShowSuccess] = useState(false);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4 font-headline">Dự án không tồn tại</h2>
          <Link to="/" className="text-red-500 font-bold hover:underline flex items-center justify-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const handleCTA = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const Icon = CATEGORY_ICONS[project.category] || Factory;

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-8">
        {/* Breadcrumbs & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-red-600 font-bold text-xs uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-4 h-4" /> Danh sách dự án
          </Link>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white border border-slate-100 px-6 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Share2 className="w-4 h-4" /> Chia sẻ
            </button>
            <button className="flex items-center gap-2 bg-red-600 px-6 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-red-700 transition-all shadow-lg shadow-red-900/20">
              <Download className="w-4 h-4" /> Tải báo cáo PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Media & Quick Info */}
          <div className="lg:col-span-2 space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-white"
            >
              <img 
                src={project.image} 
                alt={project.name}
                className="w-full aspect-video object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-8 left-8 flex gap-3">
                <span className="bg-white/90 backdrop-blur-md text-red-600 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                  {project.province}
                </span>
                <span className="bg-red-500 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                  {project.capitalType}
                </span>
                <span className="bg-orange-500 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                  {project.stage}
                </span>
              </div>
            </motion.div>

            <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-red-500/10 p-3 rounded-2xl">
                  <Icon className="w-6 h-6 text-red-600" />
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-headline">{project.name}</h1>
              </div>

              <div className="flex items-center gap-3 text-slate-500 font-medium mb-8">
                <MapPin className="w-5 h-5 text-red-500" />
                <span className="text-lg">{project.location}</span>
              </div>

              <p className="text-slate-600 leading-relaxed mb-12 text-lg">
                {project.description}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-y border-slate-50">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Vốn đầu tư</p>
                  <p className="text-2xl font-extrabold text-red-600 font-mono">${project.investmentCapital}M</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Quy mô diện tích</p>
                  <p className="text-2xl font-extrabold text-red-600 font-mono">{project.scale}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ngày khởi công</p>
                  <p className="text-2xl font-extrabold text-red-600 font-mono">{project.startDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Dự kiến hoàn thành</p>
                  <p className="text-2xl font-extrabold text-red-600 font-mono">{project.completionDate}</p>
                </div>
              </div>

              {/* Timeline Visualization */}
              <div className="mt-12 p-8 bg-slate-50 rounded-3xl">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Tiến độ dự án
                </h4>
                <div className="relative pt-8 pb-4">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 rounded-full"></div>
                  <div className="absolute top-1/2 left-0 w-2/3 h-1 bg-red-500 -translate-y-1/2 rounded-full"></div>
                  <div className="flex justify-between relative">
                    <div className="text-center">
                      <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-3 border-4 border-white shadow-sm"></div>
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{project.startDate}</p>
                      <p className="text-[9px] text-slate-400 font-bold mt-1">KHỞI CÔNG</p>
                    </div>
                    <div className="text-center">
                      <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-3 border-4 border-white shadow-sm"></div>
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Hiện tại</p>
                      <p className="text-[9px] text-red-500 font-bold mt-1 uppercase">{project.stage}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-4 h-4 bg-slate-200 rounded-full mx-auto mb-3 border-4 border-white shadow-sm"></div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{project.completionDate}</p>
                      <p className="text-[9px] text-slate-400 font-bold mt-1">HOÀN THÀNH</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-12">
                <div className="flex gap-8 border-b border-slate-100 mb-10 overflow-x-auto no-scrollbar">
                  {(['overview', 'investor', 'contractor', 'consultant'] as const).map(tab => {
                    if (tab === 'consultant' && !project.designConsultant) return null;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "pb-4 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap",
                          activeTab === tab ? "text-red-600" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {tab === 'overview' ? 'Tổng quan' : tab === 'investor' ? 'Chủ đầu tư' : tab === 'contractor' ? 'Nhà thầu' : 'Tư vấn thiết kế'}
                        {activeTab === tab && (
                          <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="min-h-[200px]"
                  >
                    {activeTab === 'overview' && (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="grid grid-cols-1 gap-6">
                            <div className="flex items-start gap-4">
                              <div className="bg-slate-50 p-2 rounded-lg"><Info className="w-4 h-4 text-slate-400" /></div>
                              <div>
                                <h4 className="font-bold text-slate-900 mb-1">Loại hình xây dựng</h4>
                                <p className="text-slate-500 text-sm">{project.constructionType}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4">
                              <div className="bg-slate-50 p-2 rounded-lg"><Map className="w-4 h-4 text-slate-400" /></div>
                              <div>
                                <h4 className="font-bold text-slate-900 mb-1">Loại hình vốn</h4>
                                <p className="text-slate-500 text-sm">{project.capitalType}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4">
                              <div className="bg-slate-50 p-2 rounded-lg"><Building2 className="w-4 h-4 text-slate-400" /></div>
                              <div>
                                <h4 className="font-bold text-slate-900 mb-1">Ngành dọc</h4>
                                <p className="text-slate-500 text-sm">{project.sector} {project.subSector && `- ${project.subSector}`}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4">
                              <div className="bg-slate-50 p-2 rounded-lg"><DollarSign className="w-4 h-4 text-slate-400" /></div>
                              <div>
                                <h4 className="font-bold text-slate-900 mb-1">Hình thức đầu tư</h4>
                                <p className="text-slate-500 text-sm">{project.investmentType}</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-8 rounded-3xl">
                            <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                              <Navigation className="w-4 h-4 text-red-500" /> Vị trí chiến lược
                            </h4>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đến Cảng biển</span>
                                <span className="text-sm font-extrabold text-red-600">{project.distanceToPort} km</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đến Sân bay</span>
                                <span className="text-sm font-extrabold text-red-600">{project.distanceToAirport} km</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đến Cao tốc</span>
                                <span className="text-sm font-extrabold text-red-600">{project.distanceToHighway} km</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'investor' && (
                      <div className="bg-slate-50 p-10 rounded-[2.5rem] space-y-8">
                        <div className="flex items-center gap-4">
                          <div className="bg-white p-4 rounded-2xl shadow-sm">
                            <UserCircle className="w-8 h-8 text-red-500" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">{project.investor.name}</h3>
                            <p className="text-red-600 text-xs font-bold uppercase tracking-widest mt-1">Chủ đầu tư chính</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-slate-200">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Địa chỉ trụ sở</p>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">{project.investor.address}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Người đại diện</p>
                            <p className="text-sm text-slate-900 font-bold">{project.investor.representative}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'contractor' && (
                      <div className="bg-slate-50 p-10 rounded-[2.5rem] space-y-8">
                        <div className="flex items-center gap-4">
                          <div className="bg-white p-4 rounded-2xl shadow-sm">
                            <HardHat className="w-8 h-8 text-orange-500" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">{project.mainContractor.name}</h3>
                            <p className="text-orange-600 text-xs font-bold uppercase tracking-widest mt-1">Nhà thầu chính</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-slate-200">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Địa chỉ văn phòng</p>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">{project.mainContractor.address}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Đại diện dự án</p>
                            <p className="text-sm text-slate-900 font-bold">{project.mainContractor.representative}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'consultant' && project.designConsultant && (
                      <div className="bg-slate-50 p-10 rounded-[2.5rem] space-y-8">
                        <div className="flex items-center gap-4">
                          <div className="bg-white p-4 rounded-2xl shadow-sm">
                            <Building className="w-8 h-8 text-purple-500" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">{project.designConsultant.name}</h3>
                            <p className="text-purple-600 text-xs font-bold uppercase tracking-widest mt-1">Tư vấn thiết kế</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-slate-200">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Địa chỉ văn phòng</p>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">{project.designConsultant.address}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Kiến trúc sư / Đại diện</p>
                            <p className="text-sm text-slate-900 font-bold">{project.designConsultant.representative}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar Actions */}
          <div className="space-y-8">
            <div className="bg-red-50 p-10 rounded-[3rem] text-slate-900 border border-red-100 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4 font-headline text-red-600">Yêu cầu thông tin</h3>
                <p className="text-slate-600 text-sm mb-8 leading-relaxed">
                  Bạn quan tâm đến dự án này? Hãy để lại thông tin để nhận báo giá và tư vấn kỹ thuật chuyên sâu.
                </p>
                <div className="space-y-4">
                  <input type="text" placeholder="Họ và tên" className="w-full bg-white border-slate-200 rounded-xl py-3 px-4 text-sm placeholder:text-slate-400 focus:ring-red-500" />
                  <input type="email" placeholder="Email công ty" className="w-full bg-white border-slate-200 rounded-xl py-3 px-4 text-sm placeholder:text-slate-400 focus:ring-red-500" />
                  <textarea placeholder="Nội dung yêu cầu..." rows={4} className="w-full bg-white border-slate-200 rounded-xl py-3 px-4 text-sm placeholder:text-slate-400 focus:ring-red-500"></textarea>
                  <button 
                    onClick={handleCTA}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-red-900/10"
                  >
                    Gửi yêu cầu ngay
                  </button>
                </div>
                <AnimatePresence>
                  {showSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl flex items-center gap-3 text-green-300 font-bold text-sm"
                    >
                      <CheckCircle2 className="w-5 h-5" /> Yêu cầu đã được gửi!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-red-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <h3 className="font-bold text-red-600 uppercase tracking-widest text-xs mb-8">Tài liệu kỹ thuật</h3>
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-500/10 p-2 rounded-lg group-hover:bg-red-500 group-hover:text-white transition-colors">
                      <Download className="w-4 h-4 text-red-600 group-hover:text-white" />
                    </div>
                    <span className="text-sm font-bold text-slate-600">Hồ sơ năng lực dự án</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">2.4 MB</span>
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-500/10 p-2 rounded-lg group-hover:bg-red-500 group-hover:text-white transition-colors">
                      <Download className="w-4 h-4 text-red-600 group-hover:text-white" />
                    </div>
                    <span className="text-sm font-bold text-slate-600">Bản vẽ sơ bộ (Draft)</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">15.8 MB</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <h3 className="font-bold text-red-600 uppercase tracking-widest text-xs mb-8">Chuyên gia phụ trách</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden">
                  <img src="https://picsum.photos/seed/expert/200/200" alt="Expert" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Mr. Nguyễn Thành Nam</h4>
                  <p className="text-xs text-slate-500 font-medium">Giám đốc Dự án Miền Nam</p>
                  <div className="flex gap-2 mt-2">
                    <button className="text-red-600 text-[10px] font-bold uppercase tracking-widest hover:underline">Liên hệ</button>
                    <span className="text-slate-300">|</span>
                    <button className="text-red-600 text-[10px] font-bold uppercase tracking-widest hover:underline">Zalo</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <h3 className="font-bold text-red-600 uppercase tracking-widest text-xs mb-8">Dự án tương tự</h3>
              <div className="space-y-6">
                {MOCK_PROJECTS.filter(p => p.id !== project.id).slice(0, 3).map(p => (
                  <Link key={p.id} to={`/project/${p.id}`} className="flex gap-4 group">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-red-600 transition-colors line-clamp-2">{p.name}</h4>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">{p.province}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
