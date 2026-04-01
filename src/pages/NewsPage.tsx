import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, Calendar, User, ArrowRight } from 'lucide-react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-error-handler';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  category: string;
  image: string;
  publishedAt: any;
  source: string;
}

export const NewsPage = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const q = query(collection(db, 'news'), orderBy('publishedAt', 'desc'), limit(10));
        let querySnapshot;
        try {
          querySnapshot = await getDocs(q);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'news');
          return;
        }
        const newsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as NewsArticle[];
        setNews(newsData);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
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
            <TrendingUp className="w-3 h-3" />
            Tin tức & Kinh tế đầu tư
          </motion.div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-headline mb-4">
            Cập nhật thị trường <span className="text-red-600">Kinh tế & Đầu tư</span>
          </h1>
          <p className="text-slate-600 max-w-2xl">
            Thông tin mới nhất về các chính sách kinh tế, xu hướng đầu tư và các dự án trọng điểm tại Việt Nam.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item, index) => (
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
                      {item.category}
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
                  <p className="text-slate-600 text-sm mb-6 line-clamp-3">
                    {item.summary}
                  </p>
                  <button className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-widest group/btn">
                    Đọc tiếp
                    <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100">
            <Newspaper className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Chưa có tin tức nào được cập nhật.</p>
          </div>
        )}
      </div>
    </div>
  );
};
