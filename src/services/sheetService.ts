import Papa from 'papaparse';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRz-6AZlmqBfu2ak70GfmpjASXN41l6NEtbIRscw-e5RaVmEWWqTPm8GjNEJ5_txXoom0sBZtfltg49/pub?gid=0&single=true&output=csv';

export interface SheetProject {
  id: string;
  name: string;
  investor: string;
  investorAddress: string;
  investorRepresentative: string;
  location: string;
  province: string;
  investmentCapital: string;
  scale: string;
  stage: string;
  sector: string;
  subSector: string;
  capitalType: string;
  completionDate: string;
  image: string;
  category: string;
  distanceToPort: string;
  distanceToAirport: string;
  distanceToHighway: string;
  description: string;
  mainContractor: string;
  mainContractorAddress: string;
  mainContractorRepresentative: string;
  designConsultant: string;
  designConsultantAddress: string;
  designConsultantRepresentative: string;
  steelStructureContractor: string;
  steelStructureContractorRepresentative: string;
  mepContractor: string;
  mepContractorRepresentative: string;
  supervisionConsultant: string;
  supervisionConsultantRepresentative: string;
  projectManagement: string;
  projectManagementRepresentative: string;
  civilContractor: string;
  civilContractorRepresentative: string;
  waterTreatmentSystem: string;
  waterTreatmentSystemRepresentative: string;
}

const CACHE_KEY = 'sheet_projects_cache';
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour

export const fetchProjectsFromSheet = async (forceRefresh = false): Promise<SheetProject[]> => {
  try {
    // Check cache first
    if (!forceRefresh) {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          console.log('Returning cached sheet data');
          return data;
        }
      }
    }

    const urlWithCacheBuster = `${SHEET_URL}${SHEET_URL.includes('?') ? '&' : '?'}_t=${Date.now()}`;
    console.log('Fetching fresh sheet data from:', urlWithCacheBuster);
    const response = await fetch(urlWithCacheBuster, {
      headers: {
        'Accept': 'text/csv,text/plain,*/*',
      },
      cache: 'no-cache'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    console.log('CSV Text received, length:', csvText.length);
    console.log('CSV Text preview (first 500 chars):', csvText.substring(0, 500));
    
    if (!csvText || csvText.trim().length < 10) {
      console.warn('CSV text is too short or empty');
      return [];
    }

    // Check if it's actually HTML (happens if Google redirects to a login page or error page)
    if (csvText.trim().toLowerCase().includes('<!doctype html') || csvText.trim().toLowerCase().includes('<html')) {
      console.error('Received HTML instead of CSV. The sheet might not be published correctly as CSV or is private.');
      throw new Error('Google Sheets trả về trang HTML thay vì dữ liệu CSV. Hãy đảm bảo bạn đã chọn "Comma-separated values (.csv)" khi Publish to web.');
    }

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (header) => header.trim().replace(/^\uFEFF/, ''),
        complete: (results) => {
          console.log('PapaParse complete. Rows found:', results.data.length);
          console.log('PapaParse meta:', results.meta);
          
          if (results.data.length === 0) {
            console.warn('No data rows found in CSV with header: true. Trying header: false fallback...');
            // Fallback to manual parsing if header: true failed but there's text
            const rawParse = Papa.parse(csvText, { skipEmptyLines: 'greedy' });
            console.log('Raw parse rows:', rawParse.data.length);
            if (rawParse.data.length > 1) {
              console.log('Raw parse first row:', rawParse.data[0]);
              console.log('Raw parse second row:', rawParse.data[1]);
            }
            resolve([]);
            return;
          }

          // Debug headers
          const headers = results.meta.fields || [];
          console.log('Detected headers:', headers);
          if (results.data.length > 0) {
            console.log('First row data:', results.data[0]);
          }

          const projects = results.data.map((row: any, index: number) => {
            // Helper to find value by multiple possible header names
            const getValue = (keys: string[]) => {
              for (const key of keys) {
                // Try exact match
                if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
                  return String(row[key]).trim();
                }
                // Try case-insensitive match if exact fails
                const actualKey = headers.find(h => h.toLowerCase() === key.toLowerCase());
                if (actualKey && row[actualKey] !== undefined && row[actualKey] !== null && row[actualKey] !== '') {
                  return String(row[actualKey]).trim();
                }
              }
              return '';
            };

            // If headers failed to parse correctly (e.g. row is an array), try index-based fallback
            const getByIndex = (idx: number) => {
              if (Array.isArray(row)) return row[idx] ? String(row[idx]).trim() : '';
              return '';
            };

            const name = getValue(['name', 'Name', 'Tên dự án', 'Project Name', 'Tên Dự Án', 'Tên', 'Project_Name', 'Project', 'Dự án']) || getByIndex(1);
            
            return {
              id: getValue(['id', 'ID', 'Mã dự án', 'STT', 'No.', 'Project_ID', 'Mã', 'Code']) || getByIndex(0) || `sheet-${index}`,
              name: name,
              investor: getValue(['investor', 'Investor', 'Chủ đầu tư', 'Chủ Đầu Tư', 'Owner', 'Investor_Name', 'Chủ đầu tư/ Chủ sở hữu']),
              investorAddress: getValue(['investorAddress', 'Địa chỉ chủ đầu tư', 'Investor Address', 'Investor_Address', 'Địa chỉ CĐT']),
              investorRepresentative: getValue(['investorRepresentative', 'Người đại diện chủ đầu tư', 'Investor Rep', 'Investor_Representative', 'Đại diện CĐT']),
              location: getValue(['location', 'Location', 'Địa điểm', 'Địa Điểm', 'Vị trí', 'Address', 'Project_Location', 'Địa chỉ']),
              province: getValue(['province', 'Province', 'Tỉnh thành', 'Tỉnh Thành', 'Tỉnh', 'City', 'Project_Province', 'Tỉnh/Thành phố']),
              investmentCapital: getValue(['investmentCapital', 'Investment Capital', 'Vốn đầu tư', 'Vốn Đầu Tư', 'Vốn (M$)', 'Vốn', 'Investment_Capital', 'Tổng mức đầu tư']) || '0',
              scale: getValue(['scale', 'Scale', 'Quy mô', 'Quy Mô', 'Diện tích', 'Size', 'Project_Scale', 'Diện tích đất']),
              stage: getValue(['stage', 'Stage', 'Trạng thái', 'Trạng Thái', 'Giai đoạn', 'Status', 'Project_Stage', 'Tiến độ']),
              sector: getValue(['sector', 'Sector', 'Ngành', 'Lĩnh vực', 'Ngành nghề', 'Industry', 'Project_Sector', 'Lĩnh vực đầu tư']),
              subSector: getValue(['subSector', 'Lĩnh vực con', 'Sub-sector', 'Ngành phụ', 'Project_SubSector', 'Phân ngành']),
              capitalType: getValue(['capitalType', 'Capital Type', 'Loại vốn', 'Loại hình vốn', 'Nguồn vốn', 'Capital_Type', 'Hình thức đầu tư']),
              completionDate: getValue(['completionDate', 'Completion Date', 'Hoàn thành', 'Ngày hoàn thành', 'Dự kiến', 'Finish', 'Completion_Date', 'Năm hoàn thành']),
              image: getValue(['image', 'Image', 'Hình ảnh', 'Ảnh', 'Link ảnh', 'Photo', 'URL', 'Project_Images', 'Project_Image', 'Hình ảnh dự án']),
              category: getValue(['category', 'Category', 'Danh mục', 'Loại hình', 'Type', 'Project_Category', 'Phân loại']) || 'FACTORY',
              distanceToPort: getValue(['distanceToPort', 'Distance to Port', 'Cảng', 'Khoảng cách cảng', 'Port Distance', 'Distance_to_Port', 'Cách cảng']) || '0',
              distanceToAirport: getValue(['distanceToAirport', 'Distance to Airport', 'Sân bay', 'Khoảng cách sân bay', 'Airport Distance', 'Distance_to_Airport', 'Cách sân bay']) || '0',
              distanceToHighway: getValue(['distanceToHighway', 'Distance to Highway', 'Cao tốc', 'Khoảng cách cao tốc', 'Highway Distance', 'Distance_to_Highway', 'Cách cao tốc']) || '0',
              description: getValue(['description', 'Description', 'Mô tả', 'Chi tiết', 'Nội dung', 'Content', 'Project_Description', 'Ghi chú']),
              mainContractor: getValue(['mainContractor', 'Tổng thầu', 'Main Contractor', 'Contractor', 'Main_Contractor', 'Nhà thầu chính']),
              mainContractorAddress: getValue(['mainContractorAddress', 'Địa chỉ tổng thầu', 'Contractor Address', 'Main_Contractor_Address', 'Địa chỉ nhà thầu']),
              mainContractorRepresentative: getValue(['mainContractorRepresentative', 'Người đại diện tổng thầu', 'Contractor Rep', 'Main_Contractor_Representative', 'Đại diện nhà thầu']),
              designConsultant: getValue(['designConsultant', 'Tư vấn thiết kế', 'Design Consultant', 'Design_Consultant', 'Đơn vị thiết kế']),
              designConsultantAddress: getValue(['designConsultantAddress', 'Địa chỉ tư vấn thiết kế', 'Design_Consultant_Address', 'Địa chỉ đơn vị thiết kế']),
              designConsultantRepresentative: getValue(['designConsultantRepresentative', 'Người đại diện tư vấn thiết kế', 'Design_Consultant_Representative', 'Đại diện đơn vị thiết kế']),
              steelStructureContractor: getValue(['steelStructureContractor', 'Nhà thầu kết cấu thép', 'Steel Structure Contractor', 'Steel_Structure_Contractor', 'Đơn vị kết cấu thép']),
              steelStructureContractorRepresentative: getValue(['steelStructureContractorRepresentative', 'Người đại diện kết cấu thép', 'Steel_Structure_Contractor_Representative', 'Đại diện kết cấu thép']),
              mepContractor: getValue(['mepContractor', 'Nhà thầu cơ điện', 'MEP Contractor', 'MEP_Contractor', 'Đơn vị cơ điện']),
              mepContractorRepresentative: getValue(['mepContractorRepresentative', 'Người đại diện cơ điện', 'MEP_Contractor_Representative', 'Đại diện cơ điện']),
              supervisionConsultant: getValue(['supervisionConsultant', 'Tư vấn giám sát', 'Supervision Consultant', 'Supervision_Consultant', 'Đơn vị giám sát']),
              supervisionConsultantRepresentative: getValue(['supervisionConsultantRepresentative', 'Người đại diện giám sát', 'Supervision_Consultant_Representative', 'Đại diện giám sát']),
              projectManagement: getValue(['projectManagement', 'Quản lý dự án', 'Project Management', 'Project_Management', 'Đơn vị quản lý dự án']),
              projectManagementRepresentative: getValue(['projectManagementRepresentative', 'Người đại diện quản lý dự án', 'Project_Management_Representative', 'Đại diện quản lý dự án']),
              civilContractor: getValue(['civilContractor', 'Nhà thầu xây dựng', 'Civil Contractor', 'Civil_Contractor', 'Đơn vị xây dựng']),
              civilContractorRepresentative: getValue(['civilContractorRepresentative', 'Người đại diện nhà thầu xây dựng', 'Civil_Contractor_Representative', 'Đại diện nhà thầu xây dựng']),
              waterTreatmentSystem: getValue(['waterTreatmentSystem', 'Hệ thống xử lý nước', 'Water Treatment System', 'Water_Treatment_System', 'Đơn vị xử lý nước']),
              waterTreatmentSystemRepresentative: getValue(['waterTreatmentSystemRepresentative', 'Người đại diện xử lý nước', 'Water_Treatment_System_Representative', 'Đại diện xử lý nước']),
            };
          }).filter(p => p.name && p.name !== 'Tên dự án'); // Filter out empty names and header row if it leaked into data

          console.log('Mapped projects:', projects.length);
          
          // Save to cache
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: projects,
            timestamp: Date.now()
          }));
          
          resolve(projects);
        },
        error: (error: any) => {
          console.error('PapaParse error:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return [];
  }
};
