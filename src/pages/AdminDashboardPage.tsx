import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Briefcase, MessageSquare, TrendingUp, Search, Filter, MoreVertical, CheckCircle2, XCircle, Newspaper, BookOpen, Plus, Loader2, RefreshCw } from 'lucide-react';
import { MOCK_LEADS } from '../data';
import { cn, cleanData } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, writeBatch, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { db, auth, googleProvider } from '../firebase';
import { fetchProjectsFromSheet } from '../services/sheetService';
import { AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { ExternalLink } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firestore-error-handler';
import { VIETNAM_PROVINCES, CAPITAL_TYPES, STAGES, CONSTRUCTION_TYPES } from '../constants';

const data = [
  { name: 'Jan', leads: 40, projects: 24 },
  { name: 'Feb', leads: 30, projects: 13 },
  { name: 'Mar', leads: 20, projects: 98 },
  { name: 'Apr', leads: 27, projects: 39 },
  { name: 'May', leads: 18, projects: 48 },
  { name: 'Jun', leads: 23, projects: 38 },
];

import { fetchAiProjectData } from '../services/aiService';
import { Project } from '../types';

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'leads' | 'projects' | 'news' | 'blog'>('leads');
  const [isMigrating, setIsMigrating] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const shouldStopBulkRef = React.useRef(false);
  const [migrationStatus, setMigrationStatus] = useState<string | React.ReactNode>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'news' | 'blog'>('news');
  const [loadingContent, setLoadingContent] = useState(false);
  const [contentList, setContentList] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    author: 'Admin',
    category: 'Kinh tế',
    academicCategory: 'Kỹ thuật',
    image: '',
    source: 'Việt Nam Phát Triển',
    tags: ''
  });
  const [stats, setStats] = useState({
    leads: 1284,
    projects: 0,
    projectsReal: 0,
    news: 0,
    blog: 0
  });

  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const handleBulkAiUpdate = async () => {
    setIsMigrating(true);
    setIsAiProcessing(true);
    setMigrationStatus('Bắt đầu phân tích AI cho các dự án cần cập nhật...');
    try {
      const projectsSnap = await getDocs(collection(db, 'projects'));
      const realSnap = await getDocs(collection(db, 'project_real'));
      
      const realDocsMap = new Map(realSnap.docs.map(doc => [doc.id, doc.data()]));
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const projectsToProcess = projectsSnap.docs.filter(doc => {
        const realData = realDocsMap.get(doc.id);
        if (!realData) return true; // Chưa từng xử lý AI
        
        // Kiểm tra xem đã xử lý AI trong 30 ngày qua chưa
        if (realData.lastAiUpdate) {
          const lastUpdate = new Date(realData.lastAiUpdate);
          if (lastUpdate > thirtyDaysAgo) {
            return false; // Bỏ qua nếu mới xử lý gần đây
          }
        }
        return true; // Cần xử lý lại
      });
      
      if (projectsToProcess.length === 0) {
        setMigrationStatus('Tất cả dự án đã được AI xử lý trong 30 ngày qua. Không có dữ liệu mới.');
        setTimeout(() => setMigrationStatus(''), 5000);
        setIsAiProcessing(false);
        setIsMigrating(false);
        return;
      }
      
      setMigrationStatus(`Tìm thấy ${projectsToProcess.length} dự án cần xử lý. Đang bắt đầu...`);
      
      let processedCount = 0;
      shouldStopBulkRef.current = false;
      for (const projectDoc of projectsToProcess) {
        if (shouldStopBulkRef.current) {
          setMigrationStatus(`Đã dừng xử lý AI. Đã xử lý ${processedCount} dự án.`);
          break;
        }
        const data = projectDoc.data() as Project;
        setMigrationStatus(`Đang xử lý AI (${processedCount + 1}/${projectsToProcess.length}): ${data.name}...`);
        
        try {
          await fetchAiProjectData(data.name, data);
          processedCount++;
          
          // Add a 10-second delay between calls to stay under the 15 RPM limit (free tier)
          if (processedCount < projectsToProcess.length && !shouldStopBulkRef.current) {
            setMigrationStatus(`Đang chờ 10 giây để tránh giới hạn API (Đã xử lý ${processedCount}/${projectsToProcess.length})...`);
            await new Promise(resolve => setTimeout(resolve, 10000));
          }
        } catch (err) {
          console.error(`Error processing AI for ${data.name}:`, err);
          setMigrationStatus(`Lỗi xử lý ${data.name}: ${(err as Error).message}. Đang chờ 15s...`);
          await new Promise(resolve => setTimeout(resolve, 15000));
        }
      }
      
      if (!shouldStopBulkRef.current) {
        setMigrationStatus(`Hoàn tất! Đã xử lý AI cho ${processedCount} dự án.`);
        setTimeout(() => setMigrationStatus(''), 5000);
      }
      
      // Refresh stats
      const rSnap = await getDocs(collection(db, 'project_real'));
      setStats(prev => ({ ...prev, projectsReal: rSnap.size }));
    } catch (error) {
      console.error("Bulk AI error:", error);
      setMigrationStatus('Lỗi xử lý AI: ' + (error as Error).message);
    } finally {
      setIsMigrating(false);
      setIsAiProcessing(false);
    }
  };

  const handleCleanUpData = async () => {
    setIsMigrating(true);
    setMigrationStatus('Đang rà soát và tối ưu dữ liệu (Deduplication)...');
    try {
      const projectsSnap = await getDocs(collection(db, 'projects'));
      const realSnap = await getDocs(collection(db, 'project_real'));
      
      const realIds = new Set(realSnap.docs.map(doc => doc.id));
      let cleanedCount = 0;
      
      const batch = writeBatch(db);
      
      projectsSnap.docs.forEach(projectDoc => {
        if (realIds.has(projectDoc.id)) {
          // It exists in both. Keep only reference fields in 'projects'
          const data = projectDoc.data();
          if (!data.name) return; // Skip if name is missing to avoid rule violation
          
          const referenceFields = {
            id: projectDoc.id,
            name: data.name,
            investmentCapital: data.investmentCapital,
            capitalType: data.capitalType,
            province: data.province,
            constructionType: data.constructionType,
            stage: data.stage,
            sector: data.sector,
            location: data.location,
            updatedAt: serverTimestamp()
          };
          
          // Check if it has extra fields
          const currentKeys = Object.keys(data);
          const refKeys = Object.keys(referenceFields);
          const hasExtra = currentKeys.some(k => !refKeys.includes(k) && k !== 'createdAt' && k !== 'updatedAt');
          
          if (hasExtra) {
            batch.set(doc(db, 'projects', projectDoc.id), cleanData(referenceFields));
            cleanedCount++;
          }
        }
      });
      
      if (cleanedCount > 0) {
        await batch.commit();
        setMigrationStatus(`Đã tối ưu hóa ${cleanedCount} dự án trùng lặp.`);
      } else {
        setMigrationStatus('Dữ liệu đã được tối ưu, không tìm thấy trùng lặp mới.');
      }
      
      setTimeout(() => setMigrationStatus(''), 5000);
    } catch (error) {
      console.error("Clean up error:", error);
      setMigrationStatus('Lỗi rà soát: ' + (error as Error).message);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingContent(true);
    try {
      // 1. Find max ID
      const projectsSnap = await getDocs(collection(db, 'projects'));
      const realSnap = await getDocs(collection(db, 'project_real'));
      
      let maxId = -1;
      const allDocs = [...projectsSnap.docs, ...realSnap.docs];
      allDocs.forEach(d => {
        const match = d.id.match(/sheet-(\d+)/);
        if (match) {
          const num = parseInt(match[1]);
          if (num > maxId) maxId = num;
        } else {
          const num = parseInt(d.id);
          if (!isNaN(num) && num > maxId) maxId = num;
        }
      });
      
      const nextId = `${maxId + 1}`;
      
      const newProjectData = {
        ...projectFormData,
        id: nextId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Save to projects (reference)
      await setDoc(doc(db, 'projects', nextId), cleanData({
        id: nextId,
        name: newProjectData.name,
        investmentCapital: newProjectData.investmentCapital,
        capitalType: newProjectData.capitalType,
        province: newProjectData.province,
        constructionType: newProjectData.constructionType,
        stage: newProjectData.stage,
        sector: newProjectData.sector,
        location: newProjectData.location,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }));
      
      // Save to project_real (full)
      await setDoc(doc(db, 'project_real', nextId), cleanData(newProjectData));
      
      setShowProjectModal(false);
      setMigrationStatus(`Đã thêm dự án mới: ${nextId}`);
      setTimeout(() => setMigrationStatus(''), 5000);
      
      // Refresh stats
      const pSnap = await getDocs(collection(db, 'projects'));
      setStats(prev => ({ ...prev, projects: pSnap.size }));
    } catch (error) {
      console.error("Error adding project:", error);
      setMigrationStatus("Lỗi khi thêm dự án: " + (error as Error).message);
    } finally {
      setLoadingContent(false);
    }
  };

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectFormData, setProjectFormData] = useState({
    name: '',
    location: '',
    province: 'Hà Nội',
    investmentCapital: '0',
    capitalType: 'FDI',
    constructionType: 'FACTORY',
    stage: 'Đang thực hiện',
    sector: 'Công nghiệp',
    description: '',
    investor: { name: '', address: '', representative: '' },
    mainContractor: { name: '', address: '', representative: '' }
  });

  const fetchContent = async (type: 'news' | 'blog') => {
    setLoadingContent(true);
    try {
      const q = query(collection(db, type), orderBy('createdAt', 'desc'));
      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, type);
        return;
      }
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContentList(data);
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoadingContent(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user?.email);
      if (user && user.email === 'doantrungnghiavt@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setIsAuthLoading(false);
    });

    const fetchStats = async () => {
      try {
        // Test connection
        setMigrationStatus('Đang kiểm tra kết nối Firestore...');
        const [projectsSnap, realSnap, newsSnap, blogSnap, leadsSnap] = await Promise.all([
          getDocs(collection(db, 'projects')),
          getDocs(collection(db, 'project_real')),
          getDocs(collection(db, 'news')),
          getDocs(collection(db, 'blog')),
          getDocs(collection(db, 'leads'))
        ]);
        
        setStats({
          projects: projectsSnap.size,
          projectsReal: realSnap.size,
          news: newsSnap.size,
          blog: blogSnap.size,
          leads: leadsSnap.size
        });
        setMigrationStatus('Kết nối Firestore OK.');
        setTimeout(() => setMigrationStatus(''), 3000);
      } catch (error) {
        console.error("Error fetching stats:", error);
        const errMessage = (error as Error).message;
        if (errMessage.includes('Missing or insufficient permissions')) {
          setMigrationStatus('Lỗi: Bạn không có quyền truy cập dữ liệu Firestore. Hãy kiểm tra lại tài khoản admin.');
        } else {
          setMigrationStatus('Lỗi kết nối Firestore: ' + errMessage);
        }
      }
    };
    fetchStats();

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
      setIsAdmin(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    if (activeTab === 'news' || activeTab === 'blog') {
      fetchContent(activeTab);
    }
  }, [activeTab]);

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingContent(true);
    try {
      const collectionName = modalType;
      const dataToSave = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        publishedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      };
      
      // Remove fields that don't belong to the specific type
      if (modalType === 'news') {
        delete (dataToSave as any).academicCategory;
        delete (dataToSave as any).tags;
      } else {
        delete (dataToSave as any).category;
        delete (dataToSave as any).source;
        delete (dataToSave as any).summary;
      }

      try {
        await addDoc(collection(db, collectionName), dataToSave);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, collectionName);
      }
      setShowModal(false);
      setFormData({
        title: '',
        summary: '',
        content: '',
        author: 'Admin',
        category: 'Kinh tế',
        academicCategory: 'Kỹ thuật',
        image: '',
        source: 'Việt Nam Phát Triển',
        tags: ''
      });
      fetchContent(modalType);
      // Refresh stats
      let snap;
      try {
        snap = await getDocs(collection(db, modalType));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, modalType);
        return;
      }
      setStats(prev => ({ ...prev, [modalType]: snap.size }));
    } catch (error) {
      console.error("Error adding content:", error);
      setMigrationStatus("Lỗi khi thêm nội dung: " + (error as Error).message);
      setTimeout(() => setMigrationStatus(''), 5000);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleDeleteContent = async (id: string, type: string) => {
    try {
      try {
        await deleteDoc(doc(db, type, id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `${type}/${id}`);
      }
      fetchContent(type as any);
      // Refresh stats
      let snap;
      try {
        snap = await getDocs(collection(db, type));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, type);
        return;
      }
      setStats(prev => ({ ...prev, [type]: snap.size }));
    } catch (error) {
      console.error("Error deleting content:", error);
    }
  };

  const handleMigrateSheet = async () => {
    console.log("handleMigrateSheet called");
    setIsMigrating(true);
    setMigrationStatus('Đang tải dữ liệu từ Google Sheet (Bỏ qua cache)...');
    try {
      const sheetData = await fetchProjectsFromSheet(true);
      console.log("Sheet data fetched:", sheetData);
      
      if (!sheetData || sheetData.length === 0) {
        console.error("No projects found in sheet data. Check console for CSV preview.");
        // Check if there's a more detailed error in console
        setMigrationStatus(
          <div>
            <p className="mb-2">Không tìm thấy dữ liệu trong Google Sheet.</p>
            <p className="text-xs opacity-80">Hãy đảm bảo bạn đã chọn "Comma-separated values (.csv)" khi Publish to web.</p>
            <a 
              href="https://docs.google.com/spreadsheets/d/e/2PACX-1vRz-6AZlmqBfu2ak70GfmpjASXN41l6NEtbIRscw-e5RaVmEWWqTPm8GjNEJ5_txXoom0sBZtfltg49/pub?gid=0&single=true&output=csv" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white underline mt-2 block"
            >
              Click vào đây để kiểm tra link CSV
            </a>
          </div>
        );
        setTimeout(() => setMigrationStatus(''), 15000);
        return;
      }
      
      setMigrationStatus(`Đã tải ${sheetData.length} dự án. Đang chuẩn bị lưu vào Firestore...`);
      
      // Firestore batch limit is 500
      const chunks = [];
      for (let i = 0; i < sheetData.length; i += 500) {
        chunks.push(sheetData.slice(i, i + 500));
      }

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        setMigrationStatus(`Đang lưu vào Firestore (Gói ${i + 1}/${chunks.length})...`);
        const batch = writeBatch(db);
        chunk.forEach((project) => {
          const projectRef = doc(collection(db, 'projects'), project.id);
          batch.set(projectRef, {
            ...project,
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp()
          });
        });
        try {
          await batch.commit();
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'projects (batch)');
          throw error; // Re-throw to stop migration
        }
      }
      
      setMigrationStatus('Đồng bộ thành công! Đã lưu ' + sheetData.length + ' dự án.');
      // Refresh stats
      let projectsSnap;
      try {
        projectsSnap = await getDocs(collection(db, 'projects'));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'projects');
        return;
      }
      setStats(prev => ({ ...prev, projects: projectsSnap.size }));
      
      setTimeout(() => setMigrationStatus(''), 5000);
    } catch (error) {
      console.error("Migration error:", error);
      setMigrationStatus('Lỗi đồng bộ: ' + (error as Error).message);
    } finally {
      setIsMigrating(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="pt-32 pb-24 text-center">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="pt-32 pb-24 text-center">
        <div className="max-w-md mx-auto bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2 font-headline">Truy cập bị từ chối</h1>
          <p className="text-slate-500 mb-8">Bạn không có quyền truy cập vào trang quản trị. Vui lòng đăng nhập bằng tài khoản admin.</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-red-900/10 hover:bg-red-700 transition-all"
          >
            Đăng nhập với Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 bg-[#f7fafc] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="flex flex-col gap-6 mb-12">
          <header className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tighter font-headline">Admin Control Panel</h1>
              <p className="text-slate-500 mt-2 font-medium">
                Quản lý nội dung, khách hàng và hệ thống dữ liệu. 
                <span className="ml-2 text-red-600 font-bold">({auth.currentUser?.email})</span>
                <button 
                  onClick={handleLogout}
                  className="ml-4 text-xs text-slate-400 hover:text-red-600 underline"
                >
                  Đăng xuất
                </button>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a 
                href="https://console.firebase.google.com/project/gen-lang-client-0352289724/firestore/databases/ai-studio-bc5f09d1-b0d7-40ff-bb58-0e6486653a36/data"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm"
              >
                <ExternalLink className="w-4 h-4" /> Firebase
              </a>
              <button 
                onClick={() => setShowProjectModal(true)}
                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-800 transition-all"
              >
                <Plus className="w-4 h-4" /> Thêm dự án
              </button>
              <button 
                onClick={() => {
                  setModalType(activeTab === 'blog' ? 'blog' : 'news');
                  setShowModal(true);
                }}
                className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-red-700 transition-all"
              >
                <Plus className="w-4 h-4" /> Thêm bài viết
              </button>
            </div>
          </header>

          {/* System Tools Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleMigrateSheet}
                disabled={isMigrating}
                className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
              >
                {isMigrating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                1. Đồng bộ Sheet
              </button>
              <button 
                onClick={handleBulkAiUpdate}
                disabled={isMigrating}
                className="flex items-center gap-2 bg-purple-50 text-purple-700 hover:bg-purple-100 px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
              >
                <Search className={cn("w-4 h-4", isMigrating && "animate-spin")} />
                2. Phân tích AI
              </button>
              <div className="h-4 w-px bg-slate-200 mx-1"></div>
              <button 
                onClick={handleCleanUpData}
                disabled={isMigrating}
                className="flex items-center gap-2 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50 border border-transparent hover:border-slate-200"
              >
                <Filter className={cn("w-4 h-4", isMigrating && "animate-spin")} />
                Rà soát trùng lặp
              </button>
            </div>
            
            {migrationStatus && (
              <div className="text-sm font-medium text-slate-700 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="animate-pulse">{migrationStatus}</span>
                {isAiProcessing && (
                  <button
                    onClick={() => { shouldStopBulkRef.current = true; }}
                    className="ml-2 bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-md text-xs font-bold transition-colors"
                  >
                    Dừng lại
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {[
            { label: 'Tổng Leads', value: stats.leads.toLocaleString(), icon: Users, color: 'red' },
            { label: 'Dự án (Firestore)', value: stats.projects.toString(), icon: Briefcase, color: 'green' },
            { label: 'Tin tức', value: stats.news.toString(), icon: Newspaper, color: 'purple' },
            { label: 'Blog học thuật', value: stats.blog.toString(), icon: BookOpen, color: 'orange' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100"
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mb-4",
                stat.color === 'red' ? "bg-red-50 text-red-600" :
                stat.color === 'green' ? "bg-green-50 text-green-600" :
                stat.color === 'purple' ? "bg-purple-50 text-purple-600" :
                "bg-orange-50 text-orange-600"
              )}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-extrabold text-slate-900 font-headline">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main List Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center overflow-x-auto">
                <div className="flex gap-4 min-w-max">
                  {[
                    { id: 'leads', name: 'Leads', icon: Users },
                    { id: 'projects', name: 'Projects', icon: Briefcase },
                    { id: 'news', name: 'News', icon: Newspaper },
                    { id: 'blog', name: 'Blog', icon: BookOpen },
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-sm transition-all",
                        activeTab === tab.id ? "bg-red-600 text-white" : "text-slate-400 hover:text-red-600"
                      )}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#f8fafc]">
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="px-8 py-4">Thông tin</th>
                      <th className="px-8 py-4">Phân loại</th>
                      <th className="px-8 py-4">Trạng thái</th>
                      <th className="px-8 py-4">Ngày tạo</th>
                      <th className="px-8 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {activeTab === 'leads' && MOCK_LEADS.map(lead => (
                      <tr key={lead.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-8 py-6">
                          <p className="font-bold text-slate-900 text-sm">{lead.name}</p>
                          <p className="text-xs text-slate-500">{lead.company}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{lead.interest}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full",
                            lead.status === 'New' ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                          )}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-xs text-slate-500">
                          {new Date(lead.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className="p-2 hover:bg-white rounded-lg transition-colors"><MoreVertical className="w-4 h-4 text-slate-400" /></button>
                        </td>
                      </tr>
                    ))}
                    {(activeTab === 'news' || activeTab === 'blog') && (
                      loadingContent ? (
                        <tr>
                          <td colSpan={5} className="px-8 py-20 text-center">
                            <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-4" />
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Đang tải dữ liệu...</p>
                          </td>
                        </tr>
                      ) : contentList.length > 0 ? (
                        contentList.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-8 py-6">
                              <p className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</p>
                              <p className="text-xs text-slate-500">{item.author}</p>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{item.category}</span>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-green-50 text-green-600">
                                Published
                              </span>
                            </td>
                            <td className="px-8 py-6 text-xs text-slate-500">
                              {item.publishedAt?.toDate ? item.publishedAt.toDate().toLocaleDateString('vi-VN') : 'N/A'}
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button 
                                onClick={() => handleDeleteContent(item.id, activeTab)}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-8 py-20 text-center">
                            <Plus className="w-8 h-8 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Chưa có dữ liệu. Nhấn "Thêm nội dung mới" để bắt đầu.</p>
                          </td>
                        </tr>
                      )
                    )}
                    {activeTab === 'projects' && (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center">
                          <Briefcase className="w-8 h-8 text-slate-200 mx-auto mb-4" />
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Dữ liệu dự án được quản lý qua Google Sheet và đồng bộ Firestore.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Charts & Insights */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-8 font-headline">Tăng trưởng Leads</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="leads" stroke="#dc2626" strokeWidth={3} dot={{ r: 4, fill: '#dc2626' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-8 font-headline">Phân bổ dự án</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="projects" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

            {/* Project Modal */}
            {showProjectModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowProjectModal(false)}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
                >
                  <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-900 font-headline">Thêm dự án mới</h3>
                    <button onClick={() => setShowProjectModal(false)} className="p-2 hover:bg-white rounded-xl transition-colors">
                      <XCircle className="w-6 h-6 text-slate-400" />
                    </button>
                  </div>
                  <form onSubmit={handleAddProject} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tên dự án</label>
                        <input 
                          required
                          type="text" 
                          value={projectFormData.name}
                          onChange={e => setProjectFormData({...projectFormData, name: e.target.value})}
                          className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tỉnh thành</label>
                        <select 
                          value={projectFormData.province}
                          onChange={e => setProjectFormData({...projectFormData, province: e.target.value})}
                          className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 transition-all"
                        >
                          {VIETNAM_PROVINCES.filter(p => p !== 'All').map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loại hình</label>
                        <select 
                          value={projectFormData.constructionType}
                          onChange={e => setProjectFormData({...projectFormData, constructionType: e.target.value})}
                          className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 transition-all"
                        >
                          {CONSTRUCTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lĩnh vực</label>
                        <input 
                          type="text" 
                          value={projectFormData.sector}
                          onChange={e => setProjectFormData({...projectFormData, sector: e.target.value})}
                          className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 transition-all"
                          placeholder="Ví dụ: Công nghiệp, Dân dụng..."
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vốn (M$)</label>
                        <input 
                          type="text" 
                          value={projectFormData.investmentCapital}
                          onChange={e => setProjectFormData({...projectFormData, investmentCapital: e.target.value})}
                          className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loại vốn</label>
                        <select 
                          value={projectFormData.capitalType}
                          onChange={e => setProjectFormData({...projectFormData, capitalType: e.target.value})}
                          className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 transition-all"
                        >
                          {CAPITAL_TYPES.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Giai đoạn</label>
                        <select 
                          value={projectFormData.stage}
                          onChange={e => setProjectFormData({...projectFormData, stage: e.target.value})}
                          className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 transition-all"
                        >
                          {STAGES.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Địa chỉ chi tiết</label>
                      <input 
                        type="text" 
                        value={projectFormData.location}
                        onChange={e => setProjectFormData({...projectFormData, location: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mô tả dự án</label>
                      <textarea 
                        rows={3}
                        value={projectFormData.description}
                        onChange={e => setProjectFormData({...projectFormData, description: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 transition-all"
                      />
                    </div>
                    <div className="pt-4">
                      <button 
                        type="submit"
                        disabled={loadingContent}
                        className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-green-900/20 hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loadingContent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Lưu dự án
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}

            {/* Add Content Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-900 font-headline">
                  Thêm {modalType === 'news' ? 'Tin tức' : 'Blog'} mới
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl transition-colors">
                  <XCircle className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleAddContent} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiêu đề</label>
                    <input 
                      required
                      type="text" 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 transition-all"
                      placeholder="Nhập tiêu đề..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {modalType === 'news' ? 'Chuyên mục' : 'Lĩnh vực học thuật'}
                    </label>
                    <input 
                      required
                      type="text" 
                      value={modalType === 'news' ? formData.category : formData.academicCategory}
                      onChange={e => setFormData({
                        ...formData, 
                        [modalType === 'news' ? 'category' : 'academicCategory']: e.target.value
                      })}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 transition-all"
                      placeholder={modalType === 'news' ? "Kinh tế, Đầu tư..." : "Kỹ thuật, Xây dựng..."}
                    />
                  </div>
                </div>

                {modalType === 'news' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tóm tắt</label>
                    <textarea 
                      required
                      rows={2}
                      value={formData.summary}
                      onChange={e => setFormData({...formData, summary: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 transition-all"
                      placeholder="Mô tả ngắn gọn nội dung..."
                    />
                  </div>
                )}

                {modalType === 'blog' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tags (cách nhau bằng dấu phẩy)</label>
                    <input 
                      type="text" 
                      value={formData.tags}
                      onChange={e => setFormData({...formData, tags: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 transition-all"
                      placeholder="kỹ thuật, xây dựng, học thuật..."
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nội dung (Markdown)</label>
                  <textarea 
                    required
                    rows={6}
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 transition-all font-mono"
                    placeholder="Nhập nội dung chi tiết..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">URL Hình ảnh</label>
                    <input 
                      type="text" 
                      value={formData.image}
                      onChange={e => setFormData({...formData, image: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 transition-all"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tác giả</label>
                    <input 
                      type="text" 
                      value={formData.author}
                      onChange={e => setFormData({...formData, author: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={loadingContent}
                    className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-red-900/20 hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loadingContent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Xuất bản nội dung
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
