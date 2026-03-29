export interface Project {
  id: string;
  name: string;
  location: string;
  province: string;
  investmentCapital: string;
  constructionType: string;
  scale: string;
  startDate: string;
  completionDate: string;
  stage: 'Concept' | 'Design & Documentation' | 'Pre-construction' | 'Construction';
  sector: 'Utilities' | 'Industrial' | 'Energy' | 'Infrastructure' | 'Building' | 'Resort';
  subSector?: string;
  investor: {
    name: string;
    address: string;
    representative: string;
  };
  mainContractor: {
    name: string;
    address: string;
    representative: string;
  };
  designConsultant?: {
    name: string;
    address: string;
    representative: string;
  };
  capitalType: string;
  investmentType: string;
  distanceToPort?: number;
  distanceToAirport?: number;
  distanceToHighway?: number;
  image: string;
  category: string;
  description: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  interest: string;
  projectId: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  category: 'ESG' | 'Technical' | 'Insights';
  author: string;
  date: string;
  image: string;
  excerpt: string;
  content: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'Environment Equipment' | 'Industrial Chemicals';
  supplier: string;
  price: string;
  image: string;
  description: string;
}
