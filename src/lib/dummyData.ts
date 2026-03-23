// Comprehensive dummy data for the admin panel

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'both';
  status: 'active' | 'suspended';
  verified: boolean;
  avatar: string;
  rating: number;
  totalOrders: number;
  totalSpent: number;
  totalEarnings: number;
  joinedDate: string;
  location: string;
  skills?: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  budget: { min: number; max: number; currency: string };
  author: string;
  authorId: string;
  type: 'hourly' | 'fixed';
  status: 'in_queue' | 'approved' | 'rejected';
  createdDate: string;
  skills: string[];
  location: string;
  proposalsCount: number;
  attachments?: string[];
  spamProbability: 'low' | 'medium' | 'high';
}

export interface Gig {
  id: string;
  title: string;
  description: string;
  category: string;
  seller: string;
  sellerId: string;
  price: number;
  currency: string;
  rating: number;
  reviewsCount: number;
  status: 'pending' | 'live' | 'paused' | 'rejected';
  createdDate: string;
  thumbnail: string;
  deliveryTime: string;
}

export interface GigOrder {
  id: string;
  gigId: string;
  gigTitle: string;
  buyer: string;
  buyerId: string;
  seller: string;
  sellerId: string;
  price: number;
  currency: string;
  status: 'in_progress' | 'delivered' | 'completed' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
}

export interface WithdrawRequest {
  id: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  currency: string;
  method: 'bank' | 'upi' | 'paypal';
  walletBalance: number;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Dispute {
  id: string;
  title: string;
  buyer: string;
  buyerId: string;
  seller: string;
  sellerId: string;
  orderReference: string;
  status: 'open' | 'under_review' | 'resolved';
  priority: 'high' | 'medium' | 'low';
  createdDate: string;
  description: string;
}

export const users: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    role: 'seller',
    status: 'active',
    verified: true,
    avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 4.8,
    totalOrders: 127,
    totalSpent: 0,
    totalEarnings: 45600,
    joinedDate: '2023-06-15',
    location: 'New York, USA',
    skills: ['React', 'Node.js', 'TypeScript']
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    role: 'buyer',
    status: 'active',
    verified: true,
    avatar: 'https://i.pravatar.cc/150?img=2',
    rating: 4.5,
    totalOrders: 45,
    totalSpent: 12300,
    totalEarnings: 0,
    joinedDate: '2024-01-10',
    location: 'San Francisco, USA'
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    email: 'emma.rodriguez@email.com',
    role: 'both',
    status: 'active',
    verified: true,
    avatar: 'https://i.pravatar.cc/150?img=3',
    rating: 4.9,
    totalOrders: 89,
    totalSpent: 8900,
    totalEarnings: 34200,
    joinedDate: '2023-08-22',
    location: 'London, UK',
    skills: ['UI/UX Design', 'Figma', 'Adobe XD']
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@email.com',
    role: 'seller',
    status: 'active',
    verified: false,
    avatar: 'https://i.pravatar.cc/150?img=4',
    rating: 4.2,
    totalOrders: 56,
    totalSpent: 0,
    totalEarnings: 18900,
    joinedDate: '2024-02-05',
    location: 'Seoul, South Korea',
    skills: ['Python', 'Django', 'Machine Learning']
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@email.com',
    role: 'buyer',
    status: 'suspended',
    verified: true,
    avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 3.8,
    totalOrders: 23,
    totalSpent: 5600,
    totalEarnings: 0,
    joinedDate: '2023-11-12',
    location: 'Toronto, Canada'
  },
  // Additional users...
  {
    id: '6',
    name: 'James Wilson',
    email: 'james.wilson@email.com',
    role: 'seller',
    status: 'active',
    verified: true,
    avatar: 'https://i.pravatar.cc/150?img=6',
    rating: 4.7,
    totalOrders: 98,
    totalSpent: 0,
    totalEarnings: 29800,
    joinedDate: '2023-09-18',
    location: 'Sydney, Australia',
    skills: ['WordPress', 'PHP', 'MySQL']
  },
  {
    id: '7',
    name: 'Sophia Martinez',
    email: 'sophia.martinez@email.com',
    role: 'both',
    status: 'active',
    verified: true,
    avatar: 'https://i.pravatar.cc/150?img=7',
    rating: 4.6,
    totalOrders: 72,
    totalSpent: 6700,
    totalEarnings: 21400,
    joinedDate: '2024-03-01',
    location: 'Madrid, Spain',
    skills: ['Content Writing', 'SEO', 'Social Media']
  },
  {
    id: '8',
    name: 'Alex Thompson',
    email: 'alex.thompson@email.com',
    role: 'buyer',
    status: 'active',
    verified: false,
    avatar: 'https://i.pravatar.cc/150?img=8',
    rating: 4.1,
    totalOrders: 18,
    totalSpent: 3200,
    totalEarnings: 0,
    joinedDate: '2024-04-12',
    location: 'Berlin, Germany'
  }
];

export const projects: Project[] = [
  {
    id: '15',
    title: 'WordPress website pages with digital marketing',
    description: 'Need a professional WordPress developer to create 5 pages with modern design and SEO optimization.',
    budget: { min: 20000, max: 48000, currency: '₹' },
    author: 'Anthony Shao',
    authorId: '2',
    type: 'hourly',
    status: 'approved',
    createdDate: '2026-01-07',
    skills: ['WordPress', 'SEO', 'Digital Marketing'],
    location: 'Mumbai, India',
    proposalsCount: 12,
    attachments: ['wireframe.pdf', 'requirements.docx'],
    spamProbability: 'low'
  },
  {
    id: '14',
    title: 'Migration card.js facility',
    description: 'Migrate existing card payment system to new framework with enhanced security features.',
    budget: { min: 40000, max: 70000, currency: '₹' },
    author: 'Antony Clara',
    authorId: '8',
    type: 'hourly',
    status: 'approved',
    createdDate: '2026-01-07',
    skills: ['JavaScript', 'Payment Gateway', 'Node.js'],
    location: 'Remote',
    proposalsCount: 8,
    spamProbability: 'low'
  },
  {
    id: '13',
    title: 'Wireless internet service provider internet connections',
    description: 'Develop a management system for WISP including customer portal and billing integration.',
    budget: { min: 50000, max: 92000, currency: '₹' },
    author: 'Ava Nguyn',
    authorId: '3',
    type: 'hourly',
    status: 'in_queue',
    createdDate: '2026-01-07',
    skills: ['Full Stack', 'React', 'PostgreSQL'],
    location: 'Bangalore, India',
    proposalsCount: 15,
    spamProbability: 'low'
  },
  {
    id: '12',
    title: 'Add arid graphql plugin, Secure WordPress website',
    description: 'Implement GraphQL API and enhance WordPress security with best practices.',
    budget: { min: 5700, max: 9500, currency: '₹' },
    author: 'Arianne Kearns',
    authorId: '4',
    type: 'fixed',
    status: 'approved',
    createdDate: '2026-01-07',
    skills: ['WordPress', 'GraphQL', 'Security'],
    location: 'Delhi, India',
    proposalsCount: 6,
    spamProbability: 'low'
  },
  {
    id: '11',
    title: 'Automation To Drop Shipping For Website',
    description: 'Create automated dropshipping system with inventory sync and order processing.',
    budget: { min: 6700, max: 8000, currency: '₹' },
    author: 'Antony Clara',
    authorId: '8',
    type: 'fixed',
    status: 'in_queue',
    createdDate: '2026-01-07',
    skills: ['APIs', 'Automation', 'E-commerce'],
    location: 'Remote',
    proposalsCount: 9,
    spamProbability: 'medium'
  }
];

export const gigs: Gig[] = [
  {
    id: '1',
    title: 'I will write REST API in react for website',
    description: 'Professional REST API development using React and Node.js with complete documentation.',
    category: 'Web Development',
    seller: 'Georgia Baker',
    sellerId: '1',
    price: 5000,
    currency: '₹',
    rating: 4.9,
    reviewsCount: 47,
    status: 'live',
    createdDate: '2026-01-07',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
    deliveryTime: '3 days'
  },
  {
    id: '2',
    title: 'school project',
    description: 'Help with school projects - programming assignments, web development, and more.',
    category: 'Education',
    seller: 'Sirigiri Naresh',
    sellerId: '6',
    price: 2000,
    currency: '₹',
    rating: 4.3,
    reviewsCount: 18,
    status: 'live',
    createdDate: '2025-01-29',
    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
    deliveryTime: '5 days'
  },
  {
    id: '3',
    title: 'Professional Logo Design & Brand Identity',
    description: 'Create stunning logos and complete brand identity packages for your business.',
    category: 'Design',
    seller: 'Emma Rodriguez',
    sellerId: '3',
    price: 3500,
    currency: '₹',
    rating: 4.8,
    reviewsCount: 92,
    status: 'live',
    createdDate: '2025-12-15',
    thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400',
    deliveryTime: '2 days'
  },
  {
    id: '4',
    title: 'Mobile App Development - iOS & Android',
    description: 'Full-stack mobile app development using React Native for both platforms.',
    category: 'Mobile Development',
    seller: 'David Kim',
    sellerId: '4',
    price: 15000,
    currency: '₹',
    rating: 4.7,
    reviewsCount: 34,
    status: 'pending',
    createdDate: '2026-01-20',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
    deliveryTime: '7 days'
  },
  {
    id: '5',
    title: 'SEO Optimization & Content Strategy',
    description: 'Boost your website ranking with professional SEO services and content planning.',
    category: 'Digital Marketing',
    seller: 'Sophia Martinez',
    sellerId: '7',
    price: 4500,
    currency: '₹',
    rating: 4.6,
    reviewsCount: 61,
    status: 'live',
    createdDate: '2025-11-22',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
    deliveryTime: '4 days'
  }
];

export const gigOrders: GigOrder[] = [
  {
    id: 'GO001',
    gigId: '1',
    gigTitle: 'I will write REST API in react for website',
    buyer: 'Michael Chen',
    buyerId: '2',
    seller: 'Georgia Baker',
    sellerId: '1',
    price: 5000,
    currency: '₹',
    status: 'in_progress',
    orderDate: '2026-01-20',
    deliveryDate: '2026-01-23'
  },
  {
    id: 'GO002',
    gigId: '3',
    gigTitle: 'Professional Logo Design & Brand Identity',
    buyer: 'Alex Thompson',
    buyerId: '8',
    seller: 'Emma Rodriguez',
    sellerId: '3',
    price: 3500,
    currency: '₹',
    status: 'delivered',
    orderDate: '2026-01-18',
    deliveryDate: '2026-01-20'
  },
  {
    id: 'GO003',
    gigId: '5',
    gigTitle: 'SEO Optimization & Content Strategy',
    buyer: 'Michael Chen',
    buyerId: '2',
    seller: 'Sophia Martinez',
    sellerId: '7',
    price: 4500,
    currency: '₹',
    status: 'completed',
    orderDate: '2026-01-10',
    deliveryDate: '2026-01-14'
  },
  {
    id: 'GO004',
    gigId: '2',
    gigTitle: 'school project',
    buyer: 'Lisa Anderson',
    buyerId: '5',
    seller: 'Sirigiri Naresh',
    sellerId: '6',
    price: 2000,
    currency: '₹',
    status: 'cancelled',
    orderDate: '2026-01-15'
  }
];

export const withdrawRequests: WithdrawRequest[] = [
  {
    id: 'WR001',
    sellerId: '1',
    sellerName: 'Sarah Johnson',
    amount: 12500,
    currency: '₹',
    method: 'bank',
    walletBalance: 45600,
    requestDate: '2026-01-22',
    status: 'pending'
  },
  {
    id: 'WR002',
    sellerId: '3',
    sellerName: 'Emma Rodriguez',
    amount: 8000,
    currency: '₹',
    method: 'paypal',
    walletBalance: 34200,
    requestDate: '2026-01-21',
    status: 'pending'
  },
  {
    id: 'WR003',
    sellerId: '6',
    sellerName: 'James Wilson',
    amount: 5000,
    currency: '₹',
    method: 'upi',
    walletBalance: 29800,
    requestDate: '2026-01-20',
    status: 'approved'
  },
  {
    id: 'WR004',
    sellerId: '4',
    sellerName: 'David Kim',
    amount: 15000,
    currency: '₹',
    method: 'bank',
    walletBalance: 18900,
    requestDate: '2026-01-19',
    status: 'rejected'
  }
];

export const disputes: Dispute[] = [
  {
    id: 'DS001',
    title: 'Incomplete delivery - Website not as described',
    buyer: 'Michael Chen',
    buyerId: '2',
    seller: 'Georgia Baker',
    sellerId: '1',
    orderReference: 'GO001',
    status: 'under_review',
    priority: 'high',
    createdDate: '2026-01-23',
    description: 'The delivered website is missing key features that were promised in the gig description.'
  },
  {
    id: 'DS002',
    title: 'Quality issues with logo design',
    buyer: 'Alex Thompson',
    buyerId: '8',
    seller: 'Emma Rodriguez',
    sellerId: '3',
    orderReference: 'GO002',
    status: 'open',
    priority: 'medium',
    createdDate: '2026-01-21',
    description: 'Logo design does not match the brief provided. Requesting revisions or refund.'
  },
  {
    id: 'DS003',
    title: 'Late delivery - Project overdue by 5 days',
    buyer: 'Lisa Anderson',
    buyerId: '5',
    seller: 'David Kim',
    sellerId: '4',
    orderReference: 'PJ012',
    status: 'resolved',
    priority: 'low',
    createdDate: '2026-01-15',
    description: 'Project was delivered 5 days late without prior communication.'
  },
  {
    id: 'DS004',
    title: 'Payment not released after completion',
    buyer: 'Michael Chen',
    buyerId: '2',
    seller: 'Sophia Martinez',
    sellerId: '7',
    orderReference: 'GO003',
    status: 'resolved',
    priority: 'high',
    createdDate: '2026-01-14',
    description: 'Work was completed and approved but payment is stuck in escrow.'
  }
];

export const categories = [
  { id: '1', name: 'Frontend Development', parentId: null, description: 'UI development and client-side programming', status: 'active', icon: '🎨' },
  { id: '2', name: 'Backend Development', parentId: null, description: 'Server-side development and APIs', status: 'active', icon: '⚙️' },
  { id: '3', name: 'Software Development', parentId: null, description: 'General software engineering', status: 'active', icon: '💻' },
  { id: '4', name: 'UI/UX Design', parentId: null, description: 'User interface and experience design', status: 'active', icon: '✨' },
  { id: '5', name: 'Mobile Development', parentId: null, description: 'iOS and Android app development', status: 'active', icon: '📱' },
  { id: '6', name: 'Digital Marketing', parentId: null, description: 'SEO, SEM, and online marketing', status: 'active', icon: '📊' },
  { id: '7', name: 'Content Writing', parentId: null, description: 'Blog posts, articles, and copywriting', status: 'active', icon: '✍️' },
  { id: '8', name: 'Graphic Design', parentId: null, description: 'Logo, branding, and visual design', status: 'active', icon: '🎭' }
];

export const skills = [
  { id: '1', name: 'React', category: 'Frontend Development', status: 'active', projectCount: 234 },
  { id: '2', name: 'Node.js', category: 'Backend Development', status: 'active', projectCount: 198 },
  { id: '3', name: 'TypeScript', category: 'Frontend Development', status: 'active', projectCount: 187 },
  { id: '4', name: 'Python', category: 'Backend Development', status: 'active', projectCount: 176 },
  { id: '5', name: 'Figma', category: 'UI/UX Design', status: 'active', projectCount: 156 },
  { id: '6', name: 'WordPress', category: 'Web Development', status: 'active', projectCount: 145 },
  { id: '7', name: 'SEO', category: 'Digital Marketing', status: 'active', projectCount: 134 },
  { id: '8', name: 'GraphQL', category: 'Backend Development', status: 'active', projectCount: 98 },
  { id: '9', name: 'React Native', category: 'Mobile Development', status: 'active', projectCount: 87 },
  { id: '10', name: 'Adobe XD', category: 'UI/UX Design', status: 'active', projectCount: 76 }
];

export const activityFeed = [
  { id: '1', type: 'user_signup', user: 'Alex Thompson', time: '2 minutes ago', action: 'View Profile' },
  { id: '2', type: 'project_posted', user: 'Michael Chen', project: 'E-commerce Website Development', time: '15 minutes ago', action: 'Review' },
  { id: '3', type: 'gig_purchased', user: 'Lisa Anderson', gig: 'Logo Design Package', time: '1 hour ago', action: 'View Order' },
  { id: '4', type: 'withdraw_requested', user: 'Sarah Johnson', amount: '₹12,500', time: '2 hours ago', action: 'Approve' },
  { id: '5', type: 'dispute_raised', user: 'Michael Chen vs Sarah Johnson', time: '3 hours ago', action: 'Review Dispute' },
  { id: '6', type: 'user_verified', user: 'Emma Rodriguez', time: '4 hours ago', action: 'View Profile' },
  { id: '7', type: 'gig_approved', seller: 'David Kim', gig: 'Mobile App Development', time: '5 hours ago', action: 'View Gig' },
  { id: '8', type: 'project_completed', project: 'WordPress Website Setup', time: '6 hours ago', action: 'View Details' }
];

export const revenueData = [
  { month: 'Jul', revenue: 32000, projects: 18000, gigs: 14000 },
  { month: 'Aug', revenue: 38000, projects: 21000, gigs: 17000 },
  { month: 'Sep', revenue: 35000, projects: 19000, gigs: 16000 },
  { month: 'Oct', revenue: 42000, projects: 24000, gigs: 18000 },
  { month: 'Nov', revenue: 48000, projects: 27000, gigs: 21000 },
  { month: 'Dec', revenue: 51000, projects: 29000, gigs: 22000 },
  { month: 'Jan', revenue: 55000, projects: 31000, gigs: 24000 }
];

export const ordersData = [
  { month: 'Jul', completed: 45, cancelled: 5 },
  { month: 'Aug', completed: 52, cancelled: 4 },
  { month: 'Sep', completed: 48, cancelled: 6 },
  { month: 'Oct', completed: 58, cancelled: 3 },
  { month: 'Nov', completed: 63, cancelled: 5 },
  { month: 'Dec', completed: 67, cancelled: 4 },
  { month: 'Jan', completed: 71, cancelled: 3 }
];
