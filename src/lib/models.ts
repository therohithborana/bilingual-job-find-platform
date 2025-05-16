
// These are mock models to represent the database schemas we would implement with MongoDB

export interface User {
  _id: string;
  role: 'worker' | 'recruiter' | 'admin';
  name: string;
  email: string;
  phone?: string;
  profilePic?: string;
  location?: string;
  languages: string[];
  createdAt: Date;
}

export interface WorkerProfile {
  userId: string;
  skills: string[];
  experienceYears: number;
  jobInterests: string[];
  qualification: string;
  availability: boolean;
  videoResumeURL?: string;
  isQuickJobActive: boolean;
  reviews: Review[];
}

export interface Recruiter {
  userId: string;
  companyName: string;
  companyType: string;
  industry: string;
  about: string;
  contactEmail: string;
  contactPhone?: string;
  isApproved: boolean;
}

export interface JobPost {
  _id: string;
  recruiterId: string;
  title: string;
  type: 'full-time' | 'part-time' | 'contract';
  category: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  experienceRequired: number;
  qualification: string;
  description: string;
  createdAt: Date;
}

export interface QuickJobRequest {
  _id: string;
  customerName: string;
  serviceType: string;
  location: string;
  workerId?: string;
  status: 'pending' | 'accepted' | 'cancelled' | 'completed';
  happyCode?: string;
  review?: Review;
  createdAt: Date;
  chatChannelId?: string;
}

export interface Review {
  rating: number;
  comment?: string;
  createdAt: Date;
}

// Mock data for development
export const MOCK_JOBS: JobPost[] = [
  {
    _id: '1',
    recruiterId: '123',
    title: 'Electrician for Commercial Project',
    type: 'full-time',
    category: 'Electrical',
    location: 'Bangalore',
    salaryMin: 18000,
    salaryMax: 25000,
    experienceRequired: 2,
    qualification: 'ITI Electrical',
    description: 'Looking for experienced electricians for a commercial building project. Must be familiar with industrial wiring and safety protocols.',
    createdAt: new Date('2023-04-15')
  },
  {
    _id: '2',
    recruiterId: '124',
    title: 'Plumber for Residential Complex',
    type: 'full-time',
    category: 'Plumbing',
    location: 'Mysore',
    salaryMin: 15000,
    salaryMax: 22000,
    experienceRequired: 1,
    qualification: 'ITI Plumbing',
    description: 'We need skilled plumbers for apartment building maintenance. Should have experience with modern plumbing systems.',
    createdAt: new Date('2023-04-10')
  },
  {
    _id: '3',
    recruiterId: '125',
    title: 'AC Technician',
    type: 'part-time',
    category: 'HVAC',
    location: 'Bangalore',
    salaryMin: 20000,
    salaryMax: 30000,
    experienceRequired: 3,
    qualification: 'HVAC Certification',
    description: 'Experienced AC technician needed for servicing and repairs. Must have knowledge of multiple brands and models.',
    createdAt: new Date('2023-04-12')
  },
  {
    _id: '4',
    recruiterId: '126',
    title: 'Construction Worker',
    type: 'contract',
    category: 'Construction',
    location: 'Hubli',
    salaryMin: 12000,
    salaryMax: 18000,
    experienceRequired: 1,
    qualification: 'None required',
    description: 'General construction workers needed for an upcoming residential project. Experience in masonry is a plus.',
    createdAt: new Date('2023-04-05')
  },
  {
    _id: '5',
    recruiterId: '127',
    title: 'Carpenter for Furniture Workshop',
    type: 'full-time',
    category: 'Carpentry',
    location: 'Bangalore',
    salaryMin: 22000,
    salaryMax: 35000,
    experienceRequired: 4,
    qualification: 'Carpentry Certification',
    description: 'Skilled carpenter with experience in creating custom furniture pieces. Must be detail-oriented and able to work with various wood types.',
    createdAt: new Date('2023-04-08')
  }
];

export const MOCK_SERVICES = [
  { id: '1', name: 'Electrician', icon: '⚡' },
  { id: '2', name: 'Plumber', icon: '🔧' },
  { id: '3', name: 'AC Technician', icon: '❄️' },
  { id: '4', name: 'Carpenter', icon: '🪚' },
  { id: '5', name: 'Painter', icon: '🎨' },
  { id: '6', name: 'Mason', icon: '🧱' },
  { id: '7', name: 'Gardener', icon: '🌱' },
  { id: '8', name: 'Driver', icon: '🚗' }
];

export const MOCK_LOCATIONS = [
  'Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Bellary', 'Davanagere'
];

export const MOCK_WORKERS: (User & Partial<WorkerProfile>)[] = [
  {
    _id: 'w1',
    role: 'worker',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '9876543210',
    location: 'Bangalore',
    languages: ['English', 'Kannada', 'Hindi'],
    createdAt: new Date('2022-05-10'),
    skills: ['Electrical', 'HVAC'],
    experienceYears: 5,
    isQuickJobActive: true
  },
  {
    _id: 'w2',
    role: 'worker',
    name: 'Suresh M',
    email: 'suresh@example.com',
    phone: '9876543211',
    location: 'Bangalore',
    languages: ['Kannada', 'Tamil'],
    createdAt: new Date('2022-06-15'),
    skills: ['Plumbing'],
    experienceYears: 3,
    isQuickJobActive: true
  },
  {
    _id: 'w3',
    role: 'worker',
    name: 'Prakash T',
    email: 'prakash@example.com',
    phone: '9876543212',
    location: 'Mysore',
    languages: ['English', 'Kannada'],
    createdAt: new Date('2022-04-20'),
    skills: ['Carpentry'],
    experienceYears: 7,
    isQuickJobActive: false
  }
];

export const MOCK_RECRUITERS: (User & Partial<Recruiter>)[] = [
  {
    _id: 'r1',
    role: 'recruiter',
    name: 'ABC Constructions',
    email: 'abc@example.com',
    phone: '9876543220',
    location: 'Bangalore',
    languages: ['English', 'Kannada'],
    createdAt: new Date('2022-01-15'),
    companyName: 'ABC Constructions Pvt Ltd',
    industry: 'Construction',
    isApproved: true
  },
  {
    _id: 'r2',
    role: 'recruiter',
    name: 'XYZ Facilities',
    email: 'xyz@example.com',
    phone: '9876543221',
    location: 'Bangalore',
    languages: ['English', 'Kannada', 'Hindi'],
    createdAt: new Date('2022-02-20'),
    companyName: 'XYZ Facilities Management',
    industry: 'Facility Management',
    isApproved: true
  }
];
