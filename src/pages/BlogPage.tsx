import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Calendar, User, ArrowRight, Tag } from 'lucide-react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-error-handler';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  academicCategory: string;
  image: string;
  publishedAt: any;
  tags: string[];
}

export const BlogPage = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const q = query(collection(db, 'blog'), orderBy('publishedAt', 'desc'), limit(10));
        let querySnapshot;
        try {
          querySnapshot = await getDocs(q);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'blog');
          return;
        }
        const blogData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BlogPost[];
        setBlogs(blogData);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-32 pb-20">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
          >
            <GraduationCap className="w-3 h-3" />
            Chia sẻ học thuật & Kỹ thuật
          </motion.div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-headline mb-4">
            Thư viện <span className="text-red-600">Kiến thức & Học thuật</span>
          </h1>
          <p className="text-slate-600 max-w-2xl">
            Các bài viết chuyên sâu về kỹ thuật xây dựng, quản lý dự án và các công cụ học thuật hữu ích.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all group"
              >
                <div className="aspect-video overflow-hidden relative">
                  <img 
                    src={item.image || `https://picsum.photos/seed/${item.id}/800/450`} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      {item.academicCategory}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.publishedAt?.toDate ? item.publishedAt.toDate().toLocaleDateString() : 'Recent'}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {item.author}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {item.tags?.map(tag => (
                      <span key={tag} className="flex items-center gap-1 bg-slate-50 text-slate-500 text-[8px] font-bold px-2 py-1 rounded-md uppercase tracking-widest">
                        <Tag className="w-2 h-2" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-widest group/btn">
                    Xem chi tiết
                    <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100">
            <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Chưa có bài viết học thuật nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};
