import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Globe, Loader2, AlertCircle, RefreshCw, ExternalLink, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateContentWithRetry } from '../lib/gemini';

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Project } from '../types';

interface ProjectSummaryProps {
  projectId: string;
  projectName: string;
  location: string;
  cachedSummary?: string;
  cachedSources?: { title: string; uri: string }[];
  onDataExtracted?: (data: {
    exactLocation?: string;
    startDate?: string;
    completionDate?: string;
    constructionType?: string;
    currentStatus?: string;
    sector?: string;
    distances?: { port?: string; airport?: string; highway?: string };
  }) => void;
  isReal?: boolean;
}

export const ProjectSummary: React.FC<ProjectSummaryProps> = ({ 
  projectId, 
  projectName, 
  location, 
  cachedSummary,
  cachedSources,
  onDataExtracted,
  isReal
}) => {
  const [summary, setSummary] = useState<string | null>(cachedSummary || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<{ title: string; uri: string }[]>(cachedSources || []);

  const generateSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: `Tìm kiếm và phân tích thông tin chi tiết về dự án "${projectName}" tại ${location}. 
        YÊU CẦU:
        1. Viết một đoạn tóm tắt ngắn gọn (dưới 2000 ký tự) về các thông tin quan trọng nhất (chủ đầu tư, quy mô, tiến độ, ý nghĩa kinh tế). 
           Lưu ý: Nếu dự án có LIÊN DANH TỔNG THẦU, hãy nêu rõ tên các đơn vị.
           KHÔNG bao gồm bất kỳ tiêu đề nào như "Tóm tắt" hay "Thông tin trích xuất".
        2. Trích xuất các thông tin sau dưới dạng JSON và đặt DUY NHẤT ở cuối câu trả lời, nằm giữa thẻ <data></data>:
        {
          "exactLocation": "Địa chỉ cụ thể chính xác của dự án (Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố)",
          "startDate": "tháng/năm hoặc Quý/năm",
          "completionDate": "tháng/năm hoặc Quý/năm",
          "constructionType": "Phân loại vào 1 trong 4 nhóm: 'Hạ tầng kỹ thuật (Infrastructure)', 'Nông nghiệp & Phát triển nông thôn', 'Công nghiệp (Factory/ Industrial)', 'Dân dụng (Building/Residential & Commercial)'",
          "currentStatus": "Dựa trên phân tích tiến độ so với năm hiện tại (2026), phân loại vào 1 trong 3 nhóm: 'Khởi công', 'Đang thực hiện', 'Hoàn Thành'",
          "sector": "Viết một đoạn tóm tắt ngắn gọn (< 100 từ) về sản phẩm hoặc hoạt động sản xuất/kinh doanh của dự án",
          "scale": "quy mô diện tích (ví dụ: 10 ha, 5 tòa nhà, 2000 căn hộ, công suất 500MW...)",
          "distances": {
            "port": "số km (chỉ ghi số)",
            "portName": "tên cảng biển",
            "airport": "số km (chỉ ghi số)",
            "airportName": "tên sân bay",
            "highway": "số km (chỉ ghi số)",
            "highwayName": "tên đường cao tốc"
          }
        }`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      }, process.env.GEMINI_API_KEY!);

      const fullText = response.text || "";
      const dataMatch = fullText.match(/<data>([\s\S]*?)<\/data>/);
      let cleanSummary = fullText.replace(/<data>[\s\S]*?<\/data>/, "").trim();
      
      setSummary(cleanSummary || "Không tìm thấy thông tin chi tiết cho dự án này.");
      
      if (dataMatch && onDataExtracted) {
        try {
          const extractedData = JSON.parse(dataMatch[1].trim());
          onDataExtracted(extractedData);
        } catch (e) {
          console.error("Failed to parse extracted data:", e);
        }
      }
      
      // Extract sources
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const extractedSources = chunks
          ? chunks
            .filter(chunk => chunk.web)
            .map(chunk => ({
              title: chunk.web!.title || 'Nguồn tin',
              uri: chunk.web!.uri
            }))
          : [];
        setSources(extractedSources);

        // Save to Firestore
        try {
          const collectionName = isReal ? 'project_real' : 'projects';
          const docRef = doc(db, collectionName, projectId);
          await updateDoc(docRef, {
            aiSummary: cleanSummary,
            aiSources: extractedSources,
            lastAiUpdate: new Date().toISOString()
          });
        } catch (e) {
          console.error("Failed to cache AI summary:", e);
        }
      }
    } catch (err: any) {
      console.error("AI Summary Error:", err);
      const errorStr = JSON.stringify(err);
      if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED') || errorStr.includes('quota')) {
        setError("Hệ thống AI đang bận (quá tải hạn mức). Vui lòng đợi 1-2 phút và thử lại.");
      } else {
        setError("Không thể tải thông tin. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!cachedSummary) {
      generateSummary();
    } else {
      setSummary(cachedSummary);
      setSources(cachedSources || []);
    }
  }, [projectId, projectName, location]);

  return (
    <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="bg-red-100 p-1.5 rounded-lg text-red-600">
            <Search className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-bold text-slate-900 text-[11px] uppercase tracking-widest">Cập nhật thông tin mới nhất của dự án hiện tại</h3>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Đang tải thông tin...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-2xl">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-xs font-medium">{error}</p>
            <button onClick={generateSummary} className="ml-auto text-xs font-bold underline">Thử lại</button>
          </div>
        ) : summary ? (
          <div className="space-y-4">
            <div className="prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed font-medium text-[13px]">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
            
            {sources.length > 0 && (
              <div className="pt-4 border-t border-slate-50">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Nguồn tham khảo:</p>
                <div className="flex flex-wrap gap-1.5">
                  {sources.slice(0, 3).map((source, i) => (
                    <a 
                      key={i}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors border border-slate-100"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {source.title.length > 25 ? source.title.substring(0, 25) + '...' : source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            <button 
              onClick={generateSummary}
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-red-600 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" /> Cập nhật lại thông tin
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm font-medium mb-4">Nhấn nút bên dưới để cập nhật thông tin chi tiết về dự án này.</p>
            <button 
              onClick={generateSummary}
              className="bg-red-600 text-white px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-900/20 hover:bg-red-700 transition-all"
            >
              Cập nhật thông tin
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
