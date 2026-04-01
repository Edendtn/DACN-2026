import { Project, Article, Product, Lead } from './types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'MIAMI HOMES VUNG TAU - HUNG THINH',
    location: '300 Phan Chu Trinh, Ward 2, Vung Tau City',
    province: 'VUNG TAU',
    investmentCapital: '43',
    constructionType: 'BUILDING',
    scale: '1 ha',
    startDate: 'Q. 1/2022',
    completionDate: 'Q. 1/2024',
    stage: 'Construction',
    sector: 'Building',
    investor: {
      name: 'HUNG THINH REAL ESTATE BUSINESS INVESTMENT CORPORATION',
      address: '110 - 112 Trần Quốc Toản, Phường 7, Quận 3, TP Hồ Chí Minh',
      representative: 'Nguyễn Đình Trung - Chủ tịch HĐQT',
      projectRepresentative: 'Lê Hoàng Nam - Giám đốc dự án'
    },
    mainContractor: {
      name: 'Công ty CP Hưng Thịnh Icons (HUNGTHINH INCONS)',
      address: '53 Trần Quốc Thảo, P.7, Q.3, TP.HCM',
      representative: 'Trần Tiến Thanh - General Director',
      fieldOfActivity: 'Xây dựng dân dụng và công nghiệp',
      personInCharge: 'Nguyễn Văn Hùng - Chỉ huy trưởng'
    },
    technicalDocuments: {
      capabilityProfile: 'Hồ sơ năng lực Hưng Thịnh Incons 2024',
      preliminaryDrawings: 'Bản vẽ thiết kế cơ sở Miami Homes'
    },
    capitalType: 'DDI',
    investmentType: 'BUILDING',
    distanceToPort: 12,
    distanceToAirport: 45,
    distanceToHighway: 2,
    image: 'https://picsum.photos/seed/miami/800/600',
    category: 'BUILDING',
    description: 'Dự án Miami Homes Vũng Tàu là tổ hợp căn hộ nghỉ dưỡng cao cấp tọa lạc tại vị trí đắc địa ven biển. Với thiết kế hiện đại, tiện ích đẳng cấp 5 sao, dự án hứa hẹn mang lại không gian sống lý tưởng và cơ hội đầu tư sinh lời cao.',
    designConsultant: {
      name: 'Hưng Thịnh Design',
      address: '53 Trần Quốc Thảo, P.7, Q.3, TP.HCM',
      representative: 'Lê Anh Tuấn - Kiến trúc sư trưởng'
    }
  },
  {
    id: '2',
    name: 'FUCHS LUBRICANTS FACTORY',
    location: 'Phu My 3 Industrial Zone, Tan Thanh District',
    province: 'VUNG TAU',
    investmentCapital: '6',
    constructionType: 'FACTORY',
    scale: '1 ha',
    startDate: 'Q. 4/2022',
    completionDate: 'Q. 1/2024',
    stage: 'Construction',
    sector: 'Industrial',
    investor: {
      name: 'Fuchs Lubricants Vietnam Co., Ltd.',
      address: 'Floor 1, Somerset Chancellor Court, 21-23 Nguyen Thi Minh Khai, District 1',
      representative: 'Ruven Ebner - Regional Vice President'
    },
    mainContractor: {
      name: 'Công ty CP Xây Lắp Sonacons',
      address: 'No. 3, Road No. 3, Bien Hoa I Industrial Zone',
      representative: 'Trần Thanh Xuân - Deputy General Director'
    },
    capitalType: 'FDI - Germany',
    investmentType: 'FACTORY',
    distanceToPort: 5,
    distanceToAirport: 65,
    distanceToHighway: 1,
    image: 'https://picsum.photos/seed/fuchs/800/600',
    category: 'FACTORY',
    description: 'Nhà máy dầu nhờn Fuchs tại KCN Phú Mỹ 3 là dự án trọng điểm của tập đoàn Fuchs (Đức) tại Việt Nam. Nhà máy được xây dựng với tiêu chuẩn hiện đại, áp dụng công nghệ sản xuất tiên tiến nhất thế giới, đảm bảo các tiêu chuẩn khắt khe về môi trường và an toàn.',
    designConsultant: {
      name: 'Royal HaskoningDHV Vietnam',
      address: 'Tầng 12, Tòa nhà Bitexco, Q.1, TP.HCM',
      representative: 'Mr. John Doe - Technical Director'
    }
  },
  {
    id: '3',
    name: 'ENTOBEL VUNG TAU FACTORY',
    location: 'Lot 05, N3 road, Dat Do I Industrial Park',
    province: 'VUNG TAU',
    investmentCapital: '10',
    constructionType: 'FACTORY',
    scale: '20 ha',
    startDate: 'Q. 3/2022',
    completionDate: 'Q. 3/2023',
    stage: 'Construction',
    sector: 'Industrial',
    investor: {
      name: 'Entobel Dong Nai Company Limited',
      address: 'Group 9, Mango Hamlet, Tan An Commune, Dong Nai',
      representative: 'Mr Đặng Thắng - Manager'
    },
    mainContractor: {
      name: 'CBC CONSTRUCTION JOINT STOCK COMPANY',
      address: '176A Trần Kế Xương, P.7, Q. Phú Nhuận, Tp. HCM',
      representative: 'Lại Đình Quỳnh - Project Director'
    },
    capitalType: 'FDI - Singapore',
    investmentType: 'FACTORY',
    distanceToPort: 25,
    distanceToAirport: 80,
    distanceToHighway: 5,
    image: 'https://picsum.photos/seed/entobel/800/600',
    category: 'FACTORY',
    description: 'Dự án nhà máy Entobel chuyên sản xuất thức ăn chăn nuôi từ côn trùng. Đây là mô hình kinh tế tuần hoàn tiên tiến, giúp giải quyết vấn đề rác thải hữu cơ và cung cấp nguồn đạm bền vững cho ngành chăn nuôi.'
  },
  {
    id: '4',
    name: 'LEGO VIETNAM MANUFACTURING PLANT',
    location: 'No. 1 Street 3, VSIP III, Binh Duong',
    province: 'BINH DUONG',
    investmentCapital: '1000+',
    constructionType: 'FACTORY',
    scale: '44 ha',
    startDate: 'Q. 2/2023',
    completionDate: 'Q. 4/2024',
    stage: 'Construction',
    sector: 'Industrial',
    investor: {
      name: 'The Lego Group',
      address: 'Binh Duong Province',
      representative: 'Mr Carsten Rasmussen - Director'
    },
    mainContractor: {
      name: 'Công ty CP xây dựng Coteccons',
      address: '236/6 Điện Biên Phủ, Phường 17, Quận Bình Thạnh, TP HCM',
      representative: 'Mr Francis Ama - Project Director'
    },
    capitalType: 'FDI - Denmark',
    investmentType: 'FACTORY',
    distanceToPort: 45,
    distanceToAirport: 20,
    distanceToHighway: 3,
    image: 'https://picsum.photos/seed/lego/800/600',
    category: 'FACTORY',
    description: 'Nhà máy Lego tại Bình Dương là dự án FDI lớn nhất từ trước đến nay của Đan Mạch tại Việt Nam. Đây là nhà máy trung hòa carbon đầu tiên của tập đoàn Lego, sử dụng năng lượng mặt trời và các giải pháp bền vững.'
  },
  {
    id: '5',
    name: 'CHARM HO TRAM RESORT',
    location: 'Ho Tram hamlet, Thuan Phuoc commune, Xuyen Moc',
    province: 'VUNG TAU',
    investmentCapital: '43',
    constructionType: 'RESORT',
    scale: '20 ha',
    startDate: 'Q. 3/2020',
    completionDate: 'Q. 3/2024',
    stage: 'Construction',
    sector: 'Resort',
    investor: {
      name: 'Công ty TNHH Du lịch khách sạn Phúc Đạt (Charm Group)',
      address: 'Quarter Hai Trung, Long Hai Town, Ba Ria - Vung Tau',
      representative: 'Ms Vũ Ngọc Trâm - Director'
    },
    mainContractor: {
      name: 'Central Construction Joint Stock Company (Central)',
      address: '204/9 Nguyen Van Huong, Thao Dien Ward, District 2, HCMC',
      representative: 'Trần Chí Cầu - Head of Construction'
    },
    capitalType: 'DDI',
    investmentType: 'FACTORY',
    distanceToPort: 15,
    distanceToAirport: 110,
    distanceToHighway: 10,
    image: 'https://picsum.photos/seed/charm/800/600',
    category: 'RESORT',
    description: 'Charm Ho Tram Resort là khu nghỉ dưỡng phức hợp quy mô lớn với các phân khu biệt thự, căn hộ biển và khách sạn cao cấp. Dự án sở hữu đường bờ biển dài và cảnh quan thiên nhiên tuyệt đẹp.'
  }
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Dòng vốn FDI vào Việt Nam dự kiến tăng 15% trong lĩnh vực hạ tầng nước',
    category: 'Insights',
    author: 'Ban Biên Tập DACN',
    date: '2024-05-22',
    image: 'https://picsum.photos/seed/fdi/800/600',
    excerpt: 'Báo cáo mới nhất cho thấy xu hướng chuyển dịch đầu tư vào các dự án hạ tầng bền vững tại Việt Nam.',
    content: 'Nội dung chi tiết về dòng vốn FDI...'
  },
  {
    id: '2',
    title: 'Chiến lược ESG và Báo cáo dấu chân carbon (PCF) cho doanh nghiệp sản xuất',
    category: 'ESG',
    author: 'Dr. Nguyen Van A',
    date: '2024-05-20',
    image: 'https://picsum.photos/seed/esg/800/600',
    excerpt: 'Làm thế nào để tối ưu hóa báo cáo ESG và giảm thiểu dấu chân carbon trong chuỗi cung ứng.',
    content: 'Nội dung chi tiết về ESG...'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Màng Lọc RO Toray',
    category: 'Environment Equipment',
    supplier: 'Toray Vietnam',
    price: 'Liên hệ',
    image: 'https://picsum.photos/seed/mbr/400/400',
    description: 'Công nghệ lọc màng tiên tiến cho xử lý nước thải công nghiệp.'
  },
  {
    id: '2',
    name: 'Hóa chất xử lý Culligan',
    category: 'Industrial Chemicals',
    supplier: 'Culligan',
    price: '15,000 VND/kg',
    image: 'https://picsum.photos/seed/pac/400/400',
    description: 'Hóa chất chuyên dụng xử lý nước lò hơi, cooling, cleaning và passivation...'
  }
];

export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Nguyễn Văn B',
    email: 'vanb@gmail.com',
    phone: '0901234567',
    company: 'Tech Solutions',
    interest: 'Hóa chất xử lý nước',
    projectId: '3',
    status: 'New',
    createdAt: '2024-03-28T10:00:00Z'
  }
];
