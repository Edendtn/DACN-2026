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
      contents: `Tìm kiếm và phân tích thông tin chi tiết cho dự án: "${projectName}" tại ${currentProject.location}. 
      Yêu cầu thông tin bao gồm:
      1. Vị trí chính xác của dự án: Tìm kiếm địa chỉ cụ thể (Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố).
      2. Chủ đầu tư: Tên công ty, Địa chỉ trụ sở, Người đại diện pháp luật.
      3. Các đơn vị tham gia (nếu có): 
         - Tổng thầu (General Contractor)
         - Nhà thầu xây dựng (Civil Contractor)
         - Nhà thầu kết cấu thép (Steel Structure Contractor)
         - Nhà thầu cơ điện (MEP Contractor)
         - Tư vấn giám sát (Supervision Consultant)
         - Quản lý dự án (Project Management)
      4. Vị trí chiến lược (Khoảng cách ước tính):
         - Tên Cảng biển gần nhất và khoảng cách (chỉ ghi số)
         - Tên Sân bay gần nhất và khoảng cách (chỉ ghi số)
         - Tên Đường cao tốc gần nhất và khoảng cách (chỉ ghi số)
      
      5. Quy mô dự án: Diện tích, số tòa nhà, công suất...
      
      6. PHÂN LOẠI DỰ ÁN (QUAN TRỌNG):
         - Loại hình: Phân loại vào 1 trong 4 nhóm: "Hạ tầng kỹ thuật (Infrastructure)", "Nông nghiệp & Phát triển nông thôn", "Công nghiệp (Factory/ Industrial)", "Dân dụng (Building/Residential & Commercial)".
         - Tình trạng hiện tại: Dựa trên phân tích tiến độ so với năm hiện tại (2026), phân loại vào 1 trong 3 nhóm: "Khởi công", "Đang thực hiện", "Hoàn Thành".
         - Lĩnh vực: Viết một đoạn tóm tắt ngắn gọn (< 100 từ) về sản phẩm hoặc hoạt động sản xuất/kinh doanh của dự án.
      
      QUAN TRỌNG: 
      - Chỉ điền thông tin nếu có thể kiểm chứng.
      - Trả về kết quả dưới dạng JSON.`,
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
