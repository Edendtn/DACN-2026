import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Briefcase, MessageSquare, TrendingUp, Search, Filter, MoreVertical, CheckCircle2, XCircle } from 'lucide-react';
import { MOCK_LEADS, MOCK_PROJECTS } from '../data';
import { cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const data = [
  { name: 'Jan', leads: 40, projects: 24 },
  { name: 'Feb', leads: 30, projects: 13 },
  { name: 'Mar', leads: 20, projects: 98 },
  { name: 'Apr', leads: 27, projects: 39 },
  { name: 'May', leads: 18, projects: 48 },
  { name: 'Jun', leads: 23, projects: 38 },
];

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'leads' | 'projects'>('leads');

  return (
    <div className="pt-24 pb-24 bg-[#f7fafc] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-8">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tighter font-headline">Lead Tracking & Admin</h1>
            <p className="text-slate-500 mt-2 font-medium">Quản lý khách hàng tiềm năng và dữ liệu dự án từ Google Sheets.</p>
          </div>
          <div className="flex gap-4">
            <button className="bg-white border border-slate-200 text-red-600 px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all">
              Đồng bộ Google Sheets
            </button>
            <button className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-lg transition-all">
              Xuất báo cáo PDF
            </button>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {[
            { label: 'Tổng Leads', value: '1,284', icon: Users, color: 'red' },
            { label: 'Dự án mới', value: '42', icon: Briefcase, color: 'green' },
            { label: 'Tỷ lệ chuyển đổi', value: '12.5%', icon: TrendingUp, color: 'purple' },
            { label: 'Tin nhắn chờ', value: '18', icon: MessageSquare, color: 'orange' },
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
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveTab('leads')}
                    className={cn(
                      "px-6 py-2 rounded-xl font-bold text-sm transition-all",
                      activeTab === 'leads' ? "bg-red-600 text-white" : "text-slate-400 hover:text-red-600"
                    )}
                  >
                    Leads List
                  </button>
                  <button 
                    onClick={() => setActiveTab('projects')}
                    className={cn(
                      "px-6 py-2 rounded-xl font-bold text-sm transition-all",
                      activeTab === 'projects' ? "bg-red-600 text-white" : "text-slate-400 hover:text-red-600"
                    )}
                  >
                    Projects List
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3" />
                    <input className="bg-[#f1f4f6] border-none rounded-lg py-2 pl-8 pr-4 text-xs w-48" placeholder="Tìm kiếm..." />
                  </div>
                  <button className="p-2 bg-[#f1f4f6] rounded-lg"><Filter className="w-4 h-4 text-slate-400" /></button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#f8fafc]">
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="px-8 py-4">Tên / Công ty</th>
                      <th className="px-8 py-4">Mối quan tâm</th>
                      <th className="px-8 py-4">Trạng thái</th>
                      <th className="px-8 py-4">Ngày tạo</th>
                      <th className="px-8 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {MOCK_LEADS.map(lead => (
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
    </div>
  );
};
