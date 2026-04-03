import { Type } from "@google/genai";
import { Project } from "../types";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/firestore-error-handler";
import { generateContentWithRetry } from "../lib/gemini";

export const fetchAiProjectData = async (projectName: string, currentProject: Project) => {
  try {
    const response = await generateContentWithRetry({
      model: "gemini-3-flash-preview",
      contents: `Bạn là một chuyên gia phân tích dữ liệu dự án công nghiệp và hạ tầng tại Việt Nam. 
      Hãy thực hiện tìm kiếm, tổng hợp và phân tích chuyên sâu cho dự án: "${projectName}" tại ${currentProject.location}. 
      
      Yêu cầu phân tích và điền các thông tin còn thiếu sau đây:
      1. VỊ TRÍ CHÍNH XÁC: Tìm kiếm địa chỉ chi tiết nhất có thể (Số nhà, đường, KCN/Khu kinh tế, phường/xã, quận/huyện, tỉnh/thành phố).
      2. CHỦ ĐẦU TƯ (INVESTOR): Phân tích mối quan hệ sở hữu (nếu là công ty con), tìm tên đầy đủ, địa chỉ trụ sở chính xác và người đại diện pháp luật hiện tại.
      3. CÁC ĐƠN VỊ THAM GIA (PARTIES): Tổng hợp danh sách các nhà thầu đã hoặc đang tham gia:
         - Tổng thầu (General Contractor)
         - Nhà thầu xây dựng (Civil Contractor)
         - Nhà thầu kết cấu thép (Steel Structure Contractor)
         - Nhà thầu cơ điện (MEP Contractor)
         - Tư vấn giám sát (Supervision Consultant)
         - Quản lý dự án (Project Management)
      4. VỊ TRÍ CHIẾN LƯỢC & LOGISTICS: Phân tích khả năng kết nối hạ tầng:
         - Tên Cảng biển/Cảng cạn gần nhất và khoảng cách đường bộ (km).
         - Tên Sân bay gần nhất và khoảng cách đường bộ (km).
         - Tên Đường cao tốc/Quốc lộ huyết mạch gần nhất và khoảng cách (km).
      
      5. QUY MÔ & THÔNG SỐ KỸ THUẬT: Diện tích đất (m2/ha), tổng diện tích sàn, số lượng nhà xưởng/tòa nhà, công suất thiết kế (nếu là nhà máy).
      
      6. PHÂN LOẠI & ĐÁNH GIÁ (QUAN TRỌNG):
         - Loại hình: Chọn 1 trong: "Hạ tầng kỹ thuật", "Nông nghiệp & Phát triển nông thôn", "Công nghiệp", "Dân dụng".
         - Tình trạng hiện tại: Phân tích tin tức mới nhất để xác định: "Khởi công", "Đang thực hiện", "Hoàn Thành".
         - Lĩnh vực & Hoạt động: Viết một đoạn phân tích chuyên sâu (< 150 từ) về chuỗi giá trị, sản phẩm đầu ra, công nghệ sử dụng hoặc tầm quan trọng kinh tế của dự án.
      
      QUAN TRỌNG: 
      - Sử dụng dữ liệu mới nhất đến năm 2026.
      - Tổng hợp từ nhiều nguồn tin cậy (Báo chí, Cổng thông tin KCN, Website công ty).
      - Trả về kết quả dưới dạng JSON chuẩn.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            exactLocation: { type: Type.STRING },
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
            },
            distances: {
              type: Type.OBJECT,
              properties: {
                port: { type: Type.NUMBER },
                portName: { type: Type.STRING },
                airport: { type: Type.NUMBER },
                airportName: { type: Type.STRING },
                highway: { type: Type.NUMBER },
                highwayName: { type: Type.STRING }
              }
            },
            scale: { type: Type.STRING },
            constructionType: { type: Type.STRING },
            currentStatus: { type: Type.STRING },
            sectorSummary: { type: Type.STRING }
          }
        }
      }
    }, process.env.GEMINI_API_KEY!);

    if (!response.text || response.text.trim() === "") {
      throw new Error("AI returned an empty response.");
    }

    const aiResult = JSON.parse(response.text);
    
    const updatedProject: Project = {
      ...currentProject,
      location: aiResult.exactLocation || currentProject.location,
      scale: aiResult.scale || currentProject.scale,
      constructionType: aiResult.constructionType || currentProject.constructionType,
      investmentType: aiResult.currentStatus || currentProject.investmentType,
      sector: aiResult.sectorSummary || currentProject.sector,
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
      distanceToPort: aiResult.distances?.port || currentProject.distanceToPort,
      portName: aiResult.distances?.portName || currentProject.portName,
      distanceToAirport: aiResult.distances?.airport || currentProject.distanceToAirport,
      airportName: aiResult.distances?.airportName || currentProject.airportName,
      distanceToHighway: aiResult.distances?.highway || currentProject.distanceToHighway,
      highwayName: aiResult.distances?.highwayName || currentProject.highwayName,
      lastAiUpdate: new Date().toISOString()
    };

    // Cache to project_real
    await setDoc(doc(db, 'project_real', currentProject.id), updatedProject, { merge: true });
    return updatedProject;
  } catch (error) {
    console.error("AI Extraction Error:", error);
    throw error;
  }
};
