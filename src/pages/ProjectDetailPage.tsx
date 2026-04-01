import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Building2, Calendar, DollarSign, Users, ChevronLeft, Download, Share2, Anchor, Plane, Navigation, Factory, Building, Hotel, GraduationCap, Briefcase, HardHat, Info, UserCircle, Map, ArrowLeft, CheckCircle2, Loader2, Search, Lock, FileText, Eye } from 'lucide-react';
import { MOCK_PROJECTS } from '../data';
import { Project } from '../types';
import { cn } from '../lib/utils';
import { fetchProjectsFromSheet } from '../services/sheetService';
import { ProjectSummary } from '../components/ProjectSummary';

const CATEGORY_ICONS: Record<string, any> = {
  FACTORY: Factory,
  BUILDING: Building,
  RESORT: Hotel,
  HOTEL: Hotel,
  SCHOOL: GraduationCap,
};

import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { GoogleGenAI, Type } from "@google/genai";
import { generateContentWithRetry } from '../lib/gemini';
import { handleFirestoreError, OperationType } from '../lib/firestore-error-handler';

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [updatingAi, setUpdatingAi] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'parties' | 'technical'>('overview');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadFormData, setLeadFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    phone: '',
  });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [isFromFirestore, setIsFromFirestore] = useState(false);
  const [isReal, setIsReal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState<Project | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [aiData, setAiData] = useState<any>({});
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = user?.email === "doantrungnghiavt@gmail.com";

  const startAd = () => {
    setShowAd(true);
    setAdCountdown(5);
    const timer = setInterval(() => {
      setAdCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto unlock after countdown
          setIsUnlocked(true);
          setShowAd(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const skipAd = () => {
    setIsUnlocked(true);
    setShowAd(false);
  };

  const handleAiData = async (extracted?: any) => {
    if (!project) return;
    if (extracted) {
      setAiData(prev => ({ ...prev, ...extracted }));
    }
    
    // Only auto-update if not already real or if manually triggered
    if (!isReal && isAdmin) {
      setUpdatingAi(true);
      try {
        const updated = await fetchAiParties(project.name, project);
        setProject(updated);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        console.error("Error updating AI data:", error);
      } finally {
        setUpdatingAi(false);
      }
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLead(true);
    try {
      await addDoc(collection(db, 'leads'), {
        ...leadFormData,
        projectId: id,
        projectName: project?.name,
        timestamp: serverTimestamp(),
        type: 'technical_document_request'
      });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setShowLeadForm(false);
      }, 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'leads');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const fetchAiParties = async (projectName: string, currentProject: Project) => {
    try {
      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: `Tìm kiếm thông tin các đơn vị thực hiện cho dự án: "${projectName}". 
        Yêu cầu thông tin bao gồm:
        1. Chủ đầu tư: Tên công ty, Địa chỉ trụ sở, Người đại diện pháp luật.
        2. Các đơn vị tham gia (nếu có): 
           - Tổng thầu (General Contractor)
           - Nhà thầu xây dựng (Civil Contractor)
           - Nhà thầu kết cấu thép (Steel Structure Contractor)
           - Nhà thầu cơ điện (MEP Contractor)
           - Tư vấn giám sát (Supervision Consultant)
           - Quản lý dự án (Project Management)
        
        QUAN TRỌNG: 
        - Chỉ điền thông tin nếu bạn tìm thấy tên chính xác hoặc có thể kiểm chứng trên website/nguồn tin cậy rằng họ thực sự tham gia dự án này.
        - Nếu không tìm thấy thông tin chắc chắn, hãy để trống hoặc ghi "Đang cập nhật".
        - TUYỆT ĐỐI KHÔNG điền bừa hoặc đoán thông tin nếu không chắc chắn.
        - Trả về kết quả dưới dạng JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              investor: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  address: { type: Type.STRING },
                  representative: { type: Type.STRING }
                }
              },
              generalContractor: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  representative: { type: Type.STRING }
                }
              },
              civilContractor: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  representative: { type: Type.STRING }
                }
              },
              steelStructureContractor: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  representative: { type: Type.STRING }
                }
              },
              mepContractor: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  representative: { type: Type.STRING }
                }
              },
              supervisionConsultant: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  representative: { type: Type.STRING }
                }
              },
              projectManagement: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  representative: { type: Type.STRING }
                }
              }
            }
          }
        }
      }, process.env.GEMINI_API_KEY!);

      const aiResult = JSON.parse(response.text);
      
      const updatedProject: Project = {
        ...currentProject,
        investor: {
          ...currentProject.investor,
          name: aiResult.investor?.name || currentProject.investor.name,
          address: aiResult.investor?.address || currentProject.investor.address,
          representative: aiResult.investor?.representative || currentProject.investor.representative,
        },
        generalContractor: aiResult.generalContractor?.name ? {
          name: aiResult.generalContractor.name,
          representative: aiResult.generalContractor.representative,
          fieldOfActivity: 'Tổng thầu'
        } : currentProject.generalContractor,
        civilContractor: aiResult.civilContractor?.name ? {
          name: aiResult.civilContractor.name,
          representative: aiResult.civilContractor.representative,
          fieldOfActivity: 'Nhà thầu xây dựng'
        } : currentProject.civilContractor,
        steelStructureContractor: aiResult.steelStructureContractor?.name ? {
          name: aiResult.steelStructureContractor.name,
          representative: aiResult.steelStructureContractor.representative,
          fieldOfActivity: 'Kết cấu thép'
        } : currentProject.steelStructureContractor,
        mepContractor: aiResult.mepContractor?.name ? {
          name: aiResult.mepContractor.name,
          representative: aiResult.mepContractor.representative,
          fieldOfActivity: 'Cơ điện (MEP)'
        } : currentProject.mepContractor,
        supervisionConsultant: aiResult.supervisionConsultant?.name ? {
          name: aiResult.supervisionConsultant.name,
          representative: aiResult.supervisionConsultant.representative,
          fieldOfActivity: 'Tư vấn giám sát'
        } : currentProject.supervisionConsultant,
        projectManagement: aiResult.projectManagement?.name ? {
          name: aiResult.projectManagement.name,
          representative: aiResult.projectManagement.representative,
          fieldOfActivity: 'Quản lý dự án'
        } : currentProject.projectManagement,
        lastAiUpdate: new Date().toISOString()
      };

      // Cache to project_real
      try {
        await setDoc(doc(db, 'project_real', currentProject.id), updatedProject, { merge: true });
        setIsReal(true);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `project_real/${currentProject.id}`);
      }
      return updatedProject;
    } catch (error) {
      console.error('Error fetching AI parties:', error);
      return currentProject;
    }
  };

  const handleManualSave = async () => {
    if (!editedProject || !id) return;
    setLoading(true);
    try {
      await setDoc(doc(db, 'project_real', id), editedProject, { merge: true });
      setProject(editedProject);
      setIsReal(true);
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `project_real/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    setEditedProject(project);
    setIsEditing(true);
  };

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // 1. Try project_real first (The verified source)
        const realRef = doc(db, 'project_real', id);
        let realSnap;
        try {
          realSnap = await getDoc(realRef);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `project_real/${id}`);
        }

        if (realSnap?.exists()) {
          const data = { id: realSnap.id, ...realSnap.data() } as Project;
          setProject(data);
          setIsReal(true);
          setIsFromFirestore(true);
          setLoading(false);
          return;
        }

        // 2. Try projects (The draft/cache source)
        const docRef = doc(db, 'projects', id);
        let docSnap;
        try {
          docSnap = await getDoc(docRef);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `projects/${id}`);
          return;
        }
        
        let currentProject: Project | undefined;

        if (docSnap.exists()) {
          currentProject = { id: docSnap.id, ...docSnap.data() } as Project;
          setIsReal(false);
          
          // Check if AI update is needed (1 month = 30 days)
          const lastUpdate = currentProject.lastAiUpdate ? new Date(currentProject.lastAiUpdate) : null;
          const oneMonthAgo = new Date();
          oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

          if (!lastUpdate || lastUpdate < oneMonthAgo) {
            setUpdatingAi(true);
            currentProject = await fetchAiParties(currentProject.name, currentProject);
            setUpdatingAi(false);
          }
          
          setProject(currentProject);
          setIsFromFirestore(true);
          setLoading(false);
          return;
        }

        // Fallback to Google Sheet
        const sheetData = await fetchProjectsFromSheet();
        const found = sheetData.find(sp => sp.id === id);
        
        if (found) {
          const mapped: Project = {
            id: found.id,
            name: found.name,
            location: found.location,
            province: found.province,
            investmentCapital: found.investmentCapital,
            constructionType: found.category,
            scale: found.scale,
            startDate: '',
            completionDate: found.completionDate,
            stage: (found.stage as any) || 'Construction',
            sector: (found.sector as any) || 'Industrial',
            subSector: found.subSector,
            investor: {
              name: found.investor,
              address: found.investorAddress,
              representative: found.investorRepresentative,
              projectRepresentative: (found as any).investorProjectRepresentative || ''
            },
            mainContractor: {
              name: found.mainContractor,
              address: found.mainContractorAddress,
              representative: found.mainContractorRepresentative,
              fieldOfActivity: (found as any).mainContractorField || 'Xây dựng tổng hợp',
              personInCharge: (found as any).mainContractorPersonInCharge || ''
            },
            designConsultant: found.designConsultant ? {
              name: found.designConsultant,
              address: found.designConsultantAddress,
              representative: found.designConsultantRepresentative,
              fieldOfActivity: (found as any).designConsultantField || 'Tư vấn thiết kế',
              personInCharge: (found as any).designConsultantPersonInCharge || ''
            } : undefined,
            steelStructureContractor: found.steelStructureContractor ? {
              name: found.steelStructureContractor,
              representative: found.steelStructureContractorRepresentative,
              fieldOfActivity: 'Kết cấu thép'
            } : undefined,
            mepContractor: found.mepContractor ? {
              name: found.mepContractor,
              representative: found.mepContractorRepresentative,
              fieldOfActivity: 'Cơ điện (MEP)'
            } : undefined,
            supervisionConsultant: found.supervisionConsultant ? {
              name: found.supervisionConsultant,
              representative: found.supervisionConsultantRepresentative,
              fieldOfActivity: 'Tư vấn giám sát'
            } : undefined,
            projectManagement: found.projectManagement ? {
              name: found.projectManagement,
              representative: found.projectManagementRepresentative,
              fieldOfActivity: 'Quản lý dự án'
            } : undefined,
            civilContractor: found.civilContractor ? {
              name: found.civilContractor,
              representative: found.civilContractorRepresentative,
              fieldOfActivity: 'Nhà thầu xây dựng'
            } : undefined,
            waterTreatmentSystem: found.waterTreatmentSystem ? {
              name: found.waterTreatmentSystem,
              representative: found.waterTreatmentSystemRepresentative,
              fieldOfActivity: 'Hệ thống xử lý nước'
            } : undefined,
            technicalDocuments: {
              capabilityProfile: (found as any).capabilityProfile || 'Hồ sơ năng lực dự án',
              preliminaryDrawings: (found as any).preliminaryDrawings || 'Bản vẽ sơ bộ'
            },
            capitalType: found.capitalType,
            investmentType: found.category,
            distanceToPort: parseFloat(found.distanceToPort) || 0,
            distanceToAirport: parseFloat(found.distanceToAirport) || 0,
            distanceToHighway: parseFloat(found.distanceToHighway) || 0,
            image: found.image,
            category: found.category,
            description: found.description,
          };

          setIsReal(false);
          // Auto AI update for new projects from sheet
          setUpdatingAi(true);
          const aiUpdated = await fetchAiParties(mapped.name, mapped);
          setProject(aiUpdated);
          setUpdatingAi(false);
        } else {
          const mockProject = MOCK_PROJECTS.find(p => p.id === id);
          setProject(mockProject);
        }
      } catch (error) {
        console.error('Error loading project:', error);
        const mockProject = MOCK_PROJECTS.find(p => p.id === id);
        setProject(mockProject);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);
  
  const isProjectCompleted = (dateStr?: string) => {
    if (!dateStr || dateStr === '---') return false;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    
    // Try to parse "Q4/2023" or "Quý 4/2023"
    const quarterMatch = dateStr.match(/(?:Q|Quý)\s*([1-4])[\/\s](\d{4})/i);
    if (quarterMatch) {
      const quarter = parseInt(quarterMatch[1]);
      const year = parseInt(quarterMatch[2]);
      const endMonth = quarter * 3;
      if (year < currentYear) return true;
      if (year === currentYear && endMonth < currentMonth) return true;
      return false;
    }
    
    // Try to parse "12/2023" or "12-2023"
    const monthMatch = dateStr.match(/(\d{1,2})[\/\-](\d{4})/);
    if (monthMatch) {
      const month = parseInt(monthMatch[1]);
      const year = parseInt(monthMatch[2]);
      if (year < currentYear) return true;
      if (year === currentYear && month < currentMonth) return true;
      return false;
    }
    
    // Try to parse just year "2023"
    const yearMatch = dateStr.match(/^(\d{4})$/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      return year < currentYear;
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Đang tải thông tin dự án...</p>
      </div>
    );
  }

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

  const completionDateStr = aiData?.completionDate || project.completionDate;
  const isActuallyCompleted = project.stage?.toLowerCase().includes('hoàn thành') || 
                             project.stage?.toLowerCase().includes('completed') ||
                             isProjectCompleted(completionDateStr);

  const Icon = CATEGORY_ICONS[project.category] || Factory;
  const hasValidImage = project.image && project.image.startsWith('http') && !project.image.includes('picsum.photos/seed');

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-8">
        {/* Breadcrumbs & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-red-600 font-bold text-xs uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-4 h-4" /> Danh sách dự án
          </Link>
          <div className="flex gap-3">
            {isAdmin && (
              <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200">
                <Lock className="w-3 h-3" /> Admin Mode
              </div>
            )}
            {isReal && !isEditing && isAdmin && (
              <button 
                onClick={startEditing}
                className="flex items-center gap-2 bg-blue-600 px-6 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
              >
                <Briefcase className="w-4 h-4" /> Chỉnh sửa dữ liệu
              </button>
            )}
            {isEditing && isAdmin && (
              <button 
                onClick={handleManualSave}
                className="flex items-center gap-2 bg-green-600 px-6 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-green-700 transition-all shadow-lg shadow-green-900/20"
              >
                <CheckCircle2 className="w-4 h-4" /> Lưu thay đổi
              </button>
            )}
            {!isReal && !isEditing && isAdmin && (
              <button 
                onClick={async () => {
                  if (project) {
                    setUpdatingAi(true);
                    await fetchAiParties(project.name, project);
                    setUpdatingAi(false);
                  }
                }}
                className="flex items-center gap-2 bg-purple-600 px-6 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-purple-700 transition-all shadow-lg shadow-purple-900/20"
              >
                <Search className="w-4 h-4" /> Xác thực & Lưu dữ liệu
              </button>
            )}
            {!isReal && !isAdmin && (
              <div className="flex items-center gap-2 bg-slate-50 px-6 py-2.5 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100">
                <Info className="w-3.5 h-3.5" /> Đăng nhập Admin để xác thực dữ liệu
              </div>
            )}
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
            {hasValidImage && (
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
            )}

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-red-500/10 p-2 rounded-xl">
                  <Icon className="w-5 h-5 text-red-600" />
                </div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-headline">
                  {isEditing ? (
                    <input 
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xl font-extrabold"
                      value={editedProject?.name || ''}
                      onChange={(e) => setEditedProject(prev => prev ? {...prev, name: e.target.value} : null)}
                    />
                  ) : project.name}
                  {isReal && (
                    <span className="ml-3 text-[9px] font-normal bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full align-middle">Dữ liệu Thực tế</span>
                  )}
                  {!isReal && isFromFirestore && (
                    <span className="ml-3 text-[9px] font-normal bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full align-middle">Dữ liệu Firestore</span>
                  )}
                  {project.id.startsWith('sheet-') && (
                    <span className="ml-3 text-[9px] font-normal bg-green-100 text-green-800 px-2 py-0.5 rounded-full align-middle">Dữ liệu từ Sheet</span>
                  )}
                </h1>
              </div>

              <div className="flex items-center gap-2 text-slate-500 font-medium mb-6">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                {isEditing ? (
                  <input 
                    type="text"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-sm"
                    value={editedProject?.location || ''}
                    onChange={(e) => setEditedProject(prev => prev ? {...prev, location: e.target.value} : null)}
                  />
                ) : (
                  <span className="text-sm">{project.location}</span>
                )}
              </div>

              {isEditing ? (
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 leading-relaxed mb-8 h-32"
                  value={editedProject?.description || ''}
                  onChange={(e) => setEditedProject(prev => prev ? {...prev, description: e.target.value} : null)}
                />
              ) : (
                <p className="text-slate-600 leading-relaxed mb-8 text-sm">
                  {project.description}
                </p>
              )}

              <div className="mb-8">
                <ProjectSummary 
                  projectId={project.id}
                  projectName={project.name} 
                  location={project.location} 
                  cachedSummary={project.aiSummary}
                  cachedSources={project.aiSources}
                  onDataExtracted={handleAiData}
                  isReal={isReal}
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-slate-50">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vốn đầu tư</p>
                  <p className="text-lg font-extrabold text-red-600 font-mono">${project.investmentCapital}M</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Quy mô diện tích</p>
                  <p className="text-lg font-extrabold text-red-600 font-mono">{aiData?.scale || project.scale || '---'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ngày khởi công</p>
                  <p className="text-lg font-extrabold text-red-600 font-mono">{aiData?.startDate || project.startDate || '---'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dự kiến hoàn thành</p>
                  <p className="text-lg font-extrabold text-red-600 font-mono">{aiData?.completionDate || project.completionDate || '---'}</p>
                </div>
              </div>

              {/* Timeline Visualization */}
              <div className="mt-8 p-6 bg-slate-50 rounded-2xl">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Tiến độ dự án
                </h4>
                <div className="relative pt-6 pb-2">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 rounded-full"></div>
                  {/* Progress Bar Logic */}
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-red-500 -translate-y-1/2 rounded-full transition-all duration-1000"
                    style={{ 
                      width: isActuallyCompleted 
                        ? '100%' 
                        : (project.stage?.toLowerCase().includes('đang thực hiện') || project.stage?.toLowerCase().includes('construction'))
                        ? '65%'
                        : '20%'
                    }}
                  ></div>
                  
                  <div className="flex justify-between relative">
                    <div className="text-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-2 border-2 border-white shadow-sm"></div>
                      <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest">{aiData?.startDate || project.startDate || '---'}</p>
                      <p className="text-[8px] text-slate-400 font-bold mt-1">KHỞI CÔNG</p>
                    </div>
                    
                    {!isActuallyCompleted && (
                      <div className="text-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-2 border-2 border-white shadow-sm"></div>
                        <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest">Hiện tại</p>
                        <p className="text-[8px] text-red-500 font-bold mt-1 uppercase">ĐANG THỰC HIỆN</p>
                      </div>
                    )}

                    <div className="text-center">
                      <div className={cn(
                        "w-3 h-3 rounded-full mx-auto mb-2 border-2 border-white shadow-sm",
                        isActuallyCompleted ? "bg-red-500" : "bg-slate-200"
                      )}></div>
                      <p className={cn(
                        "text-[9px] font-bold uppercase tracking-widest",
                        isActuallyCompleted ? "text-red-600" : "text-slate-400"
                      )}>{completionDateStr || '---'}</p>
                      <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase">
                        {isActuallyCompleted ? 'HOÀN THÀNH' : 'DỰ KIẾN HOÀN THÀNH'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-8">
                <div className="flex gap-6 border-b border-slate-100 mb-8 overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={cn(
                      "pb-3 text-[10px] font-bold uppercase tracking-widest transition-all relative whitespace-nowrap",
                      activeTab === 'overview' ? "text-red-600" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Tổng quan
                    {activeTab === 'overview' && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('parties')}
                    className={cn(
                      "pb-3 text-[10px] font-bold uppercase tracking-widest transition-all relative whitespace-nowrap",
                      activeTab === 'parties' ? "text-red-600" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Các đơn vị thực hiện
                    {activeTab === 'parties' && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('technical')}
                    className={cn(
                      "pb-3 text-[10px] font-bold uppercase tracking-widest transition-all relative whitespace-nowrap flex items-center gap-2",
                      activeTab === 'technical' ? "text-red-600" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Tài liệu kĩ thuật
                    {!isUnlocked && <Lock className="w-3 h-3" />}
                    {activeTab === 'technical' && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
                    )}
                  </button>
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
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-start gap-3">
                              <div className="bg-slate-50 p-1.5 rounded-lg"><Info className="w-3.5 h-3.5 text-slate-400" /></div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-xs mb-0.5">Loại hình xây dựng</h4>
                                <p className="text-slate-500 text-[11px]">{project.constructionType}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="bg-slate-50 p-1.5 rounded-lg"><Map className="w-3.5 h-3.5 text-slate-400" /></div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-xs mb-0.5">Loại hình vốn</h4>
                                <p className="text-slate-500 text-[11px]">{project.capitalType}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="bg-slate-50 p-1.5 rounded-lg"><Building2 className="w-3.5 h-3.5 text-slate-400" /></div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-xs mb-0.5">Lĩnh vực</h4>
                                <p className="text-slate-500 text-[11px]">{project.sector} {project.subSector && `- ${project.subSector}`}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="bg-slate-50 p-1.5 rounded-lg"><DollarSign className="w-3.5 h-3.5 text-slate-400" /></div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-xs mb-0.5">Hình thức đầu tư</h4>
                                <p className="text-slate-500 text-[11px]">{project.investmentType}</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-6 rounded-2xl">
                            <h4 className="font-bold text-slate-900 text-xs mb-4 flex items-center gap-2">
                              <Navigation className="w-3.5 h-3.5 text-red-500" /> Vị trí chiến lược
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Đến Cảng biển</span>
                                <span className="text-xs font-extrabold text-red-600">{project.distanceToPort} km</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Đến Sân bay</span>
                                <span className="text-xs font-extrabold text-red-600">{project.distanceToAirport} km</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Đến Cao tốc</span>
                                <span className="text-xs font-extrabold text-red-600">{project.distanceToHighway} km</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'parties' && (
                      <div className="space-y-8">
                        {!isUnlocked ? (
                          <div className="bg-white p-12 rounded-[3rem] border border-dashed border-slate-200 text-center shadow-sm">
                            <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                              <Lock className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Thông tin bị khóa</h3>
                            <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">Vui lòng xem quảng cáo ngắn (5-10s) để mở khóa thông tin chi tiết về Chủ đầu tư và các Nhà thầu liên quan.</p>
                            <button 
                              onClick={startAd}
                              className="bg-red-600 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/10"
                            >
                              Xem quảng cáo & Mở khóa
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Investor */}
                            <div className="space-y-6">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="bg-red-50 p-2 rounded-lg"><Building2 className="w-4 h-4 text-red-600" /></div>
                                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Chủ đầu tư</h4>
                              </div>
                              <div className="space-y-4 pl-11">
                                <div>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tên chủ đầu tư</p>
                                  {isEditing ? (
                                    <input 
                                      type="text"
                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs font-bold"
                                      value={editedProject?.investor.name || ''}
                                      onChange={(e) => setEditedProject(prev => prev ? {...prev, investor: {...prev.investor, name: e.target.value}} : null)}
                                    />
                                  ) : (
                                    <p className="text-slate-900 text-xs font-bold">{project.investor.name}</p>
                                  )}
                                </div>
                                <div>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Địa chỉ</p>
                                  {isEditing ? (
                                    <input 
                                      type="text"
                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-[11px]"
                                      value={editedProject?.investor.address || ''}
                                      onChange={(e) => setEditedProject(prev => prev ? {...prev, investor: {...prev.investor, address: e.target.value}} : null)}
                                    />
                                  ) : (
                                    <p className="text-slate-500 text-[11px] leading-relaxed">{project.investor.address || '---'}</p>
                                  )}
                                </div>
                                <div>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Đại diện công ty</p>
                                  {isEditing ? (
                                    <input 
                                      type="text"
                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs font-bold"
                                      value={editedProject?.investor.representative || ''}
                                      onChange={(e) => setEditedProject(prev => prev ? {...prev, investor: {...prev.investor, representative: e.target.value}} : null)}
                                    />
                                  ) : (
                                    <p className="text-slate-900 text-xs font-bold">{project.investor.representative || '---'}</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Contractors */}
                            <div className="space-y-6">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="bg-red-50 p-2 rounded-lg"><HardHat className="w-4 h-4 text-red-600" /></div>
                                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Các nhà thầu liên quan</h4>
                              </div>
                              
                              <div className="space-y-6 pl-11">
                                {isEditing ? (
                                  <div className="space-y-4">
                                    {['generalContractor', 'civilContractor', 'steelStructureContractor', 'mepContractor', 'supervisionConsultant', 'projectManagement'].map((key) => {
                                      const labels: any = {
                                        generalContractor: 'Tổng thầu',
                                        civilContractor: 'Nhà thầu xây dựng',
                                        steelStructureContractor: 'Nhà thầu kết cấu thép',
                                        mepContractor: 'Nhà thầu cơ điện',
                                        supervisionConsultant: 'Tư vấn giám sát',
                                        projectManagement: 'Quản lý dự án'
                                      };
                                      const field = key as keyof Project;
                                      const party = editedProject?.[field] as any;
                                      
                                      return (
                                        <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                          <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-2">{labels[key]}</p>
                                          <input 
                                            type="text"
                                            placeholder="Tên đơn vị"
                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs font-bold mb-2"
                                            value={party?.name || ''}
                                            onChange={(e) => setEditedProject(prev => {
                                              if (!prev) return null;
                                              return {
                                                ...prev,
                                                [field]: { ...(prev[field] as any || {}), name: e.target.value }
                                              };
                                            })}
                                          />
                                          <input 
                                            type="text"
                                            placeholder="Đại diện"
                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1 text-[10px]"
                                            value={party?.representative || ''}
                                            onChange={(e) => setEditedProject(prev => {
                                              if (!prev) return null;
                                              return {
                                                ...prev,
                                                [field]: { ...(prev[field] as any || {}), representative: e.target.value }
                                              };
                                            })}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <>
                                    {project.generalContractor?.name && (
                                      <div>
                                        <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1">Tổng thầu</p>
                                        <p className="text-slate-900 text-xs font-bold">{project.generalContractor.name}</p>
                                        <p className="text-[10px] text-slate-500 mt-1">Đại diện: {project.generalContractor.representative || '---'}</p>
                                      </div>
                                    )}
                                    {project.civilContractor?.name && (
                                      <div>
                                        <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1">Nhà thầu xây dựng</p>
                                        <p className="text-slate-900 text-xs font-bold">{project.civilContractor.name}</p>
                                        <p className="text-[10px] text-slate-500 mt-1">Đại diện: {project.civilContractor.representative || '---'}</p>
                                      </div>
                                    )}
                                    {project.steelStructureContractor?.name && (
                                      <div>
                                        <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1">Nhà thầu kết cấu thép</p>
                                        <p className="text-slate-900 text-xs font-bold">{project.steelStructureContractor.name}</p>
                                        <p className="text-[10px] text-slate-500 mt-1">Đại diện: {project.steelStructureContractor.representative || '---'}</p>
                                      </div>
                                    )}
                                    {project.mepContractor?.name && (
                                      <div>
                                        <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1">Nhà thầu cơ điện</p>
                                        <p className="text-slate-900 text-xs font-bold">{project.mepContractor.name}</p>
                                        <p className="text-[10px] text-slate-500 mt-1">Đại diện: {project.mepContractor.representative || '---'}</p>
                                      </div>
                                    )}
                                    {project.supervisionConsultant?.name && (
                                      <div>
                                        <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1">Tư vấn giám sát</p>
                                        <p className="text-slate-900 text-xs font-bold">{project.supervisionConsultant.name}</p>
                                        <p className="text-[10px] text-slate-500 mt-1">Đại diện: {project.supervisionConsultant.representative || '---'}</p>
                                      </div>
                                    )}
                                    {project.projectManagement?.name && (
                                      <div>
                                        <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1">Quản lý dự án</p>
                                        <p className="text-slate-900 text-xs font-bold">{project.projectManagement.name}</p>
                                        <p className="text-[10px] text-slate-500 mt-1">Đại diện: {project.projectManagement.representative || '---'}</p>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'technical' && (
                      <div className="relative">
                        {!showLeadForm && !showSuccess ? (
                          <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <FileText className="w-8 h-8 text-slate-300 mb-4" />
                            <h4 className="text-sm font-bold text-slate-900 mb-2">Yêu cầu tài liệu kỹ thuật</h4>
                            <p className="text-xs text-slate-500 mb-6 text-center max-w-xs">Để nhận hồ sơ năng lực và bản vẽ sơ bộ, vui lòng để lại thông tin. Chúng tôi sẽ gửi tài liệu qua email của bạn.</p>
                            <button 
                              onClick={() => setShowLeadForm(true)}
                              className="bg-red-600 text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                              <FileText className="w-3.5 h-3.5" /> Điền thông tin nhận tài liệu
                            </button>
                          </div>
                        ) : showSuccess ? (
                          <div className="flex flex-col items-center justify-center py-12 bg-green-50 rounded-2xl border border-dashed border-green-200">
                            <CheckCircle2 className="w-8 h-8 text-green-500 mb-4" />
                            <h4 className="text-sm font-bold text-green-900 mb-2">Gửi yêu cầu thành công!</h4>
                            <p className="text-xs text-green-600 text-center max-w-xs">Chúng tôi đã nhận được yêu cầu của bạn và sẽ gửi tài liệu qua email sớm nhất có thể.</p>
                          </div>
                        ) : (
                          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                            <h4 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Thông tin nhận tài liệu</h4>
                            <form onSubmit={handleLeadSubmit} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Họ và tên</label>
                                  <input 
                                    required
                                    type="text" 
                                    value={leadFormData.fullName}
                                    onChange={e => setLeadFormData({...leadFormData, fullName: e.target.value})}
                                    className="w-full bg-slate-50 border-slate-200 rounded-xl py-2 px-4 text-xs focus:ring-red-500" 
                                    placeholder="Nguyễn Văn A"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</label>
                                  <input 
                                    required
                                    type="email" 
                                    value={leadFormData.email}
                                    onChange={e => setLeadFormData({...leadFormData, email: e.target.value})}
                                    className="w-full bg-slate-50 border-slate-200 rounded-xl py-2 px-4 text-xs focus:ring-red-500" 
                                    placeholder="email@company.com"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tên công ty</label>
                                  <input 
                                    required
                                    type="text" 
                                    value={leadFormData.company}
                                    onChange={e => setLeadFormData({...leadFormData, company: e.target.value})}
                                    className="w-full bg-slate-50 border-slate-200 rounded-xl py-2 px-4 text-xs focus:ring-red-500" 
                                    placeholder="Công ty ABC"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Số điện thoại</label>
                                  <input 
                                    required
                                    type="tel" 
                                    value={leadFormData.phone}
                                    onChange={e => setLeadFormData({...leadFormData, phone: e.target.value})}
                                    className="w-full bg-slate-50 border-slate-200 rounded-xl py-2 px-4 text-xs focus:ring-red-500" 
                                    placeholder="0901234567"
                                  />
                                </div>
                              </div>
                              <div className="pt-4 flex gap-4">
                                <button 
                                  type="button"
                                  onClick={() => setShowLeadForm(false)}
                                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                  Hủy
                                </button>
                                <button 
                                  type="submit"
                                  disabled={isSubmittingLead}
                                  className="flex-[2] bg-red-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/10 disabled:opacity-50"
                                >
                                  {isSubmittingLead ? 'Đang gửi...' : 'Gửi yêu cầu tài liệu'}
                                </button>
                              </div>
                            </form>
                          </div>
                        )}
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

      {/* Ad Modal */}
      <AnimatePresence>
        {showAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="h-full bg-red-600"
                />
              </div>
              <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Đang mở khóa nội dung...</h3>
              <p className="text-slate-500 text-sm mb-8">Vui lòng chờ trong giây lát để hệ thống xác thực và mở khóa thông tin chi tiết.</p>
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full border-4 border-red-100 border-t-red-600 animate-spin" />
                <span className="text-2xl font-black text-red-600">{adCountdown}s</span>
              </div>
              <button 
                onClick={skipAd}
                className="text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-red-600 transition-colors"
              >
                Bỏ qua quảng cáo
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
