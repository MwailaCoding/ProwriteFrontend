// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

// User Types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isPremium?: boolean;
  isAdmin?: boolean;
  createdAt?: string;
  lastLogin?: string;
}

// Extended User Profile Types
export interface UserProfile extends User {
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  dateOfBirth?: string;
  gender?: string;
  timezone?: string;
  language?: string;
  preferences?: UserPreferences;
  security?: SecuritySettings;
  activity?: UserActivity;
  subscription?: SubscriptionInfo;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  resume: ResumePreferences;
  ai: AIPreferences;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  marketing: boolean;
  security: boolean;
  updates: boolean;
  reminders: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'connections';
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  allowSearch: boolean;
  dataSharing: boolean;
}

export interface ResumePreferences {
  defaultTemplate: number;
  autoSave: boolean;
  showTips: boolean;
  enableATS: boolean;
  defaultLanguage: string;
}

export interface AIPreferences {
  enhancementLevel: 'basic' | 'standard' | 'advanced';
  tone: 'professional' | 'creative' | 'casual' | 'formal';
  autoEnhance: boolean;
  enableSuggestions: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  sessionTimeout: number;
  passwordLastChanged?: string;
  trustedDevices: TrustedDevice[];
}

export interface TrustedDevice {
  id: string;
  name: string;
  type: string;
  lastUsed: string;
  location?: string;
}

export interface UserActivity {
  lastActive: string;
  totalLogins: number;
  resumesCreated: number;
  coverLettersCreated: number;
  templatesUsed: number;
  aiEnhancements: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'login' | 'resume_created' | 'resume_updated' | 'cover_letter_created' | 'template_used' | 'ai_enhancement' | 'payment' | 'profile_update';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SubscriptionInfo {
  plan: 'free' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  features: string[];
  usage: UsageStats;
}

export interface UsageStats {
  resumesThisMonth: number;
  coverLettersThisMonth: number;
  aiEnhancementsThisMonth: number;
  storageUsed: number;
  maxStorage: number;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// Template Types
export interface Template {
  template_id: number;
  name: string;
  description: string;
  category: string;
  industry: string;
  file_path: string;
  thumbnail_url?: string;
  is_premium: boolean;
  price: number;
  is_active: boolean;
  created_at: string;
  sections?: TemplateSection[];
}

// PDF Template Types
export interface PDFTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  pdfFile: string; // URL to stored PDF file
  thumbnailUrl: string; // Generated preview image
  pageCount: number;
  contentAreas: PDFContentArea[];
  metadata: PDFTemplateMetadata;
  tags: string[];
  popularity: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PDFContentArea {
  id: string;
  name: string;
  formField: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
    page: number;
  };
  styling: {
    fontSize: number;
    fontFamily: string;
    fontWeight: 'normal' | 'bold' | 'lighter';
    color: string;
  };
  placeholder: string;
  isRequired: boolean;
}

export interface PDFTemplateMetadata {
  pageCount: number;
  orientation: 'portrait' | 'landscape';
  pageSize: 'a4' | 'letter' | 'legal' | 'custom';
  colorScheme: 'professional' | 'creative' | 'minimal' | 'executive';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetAudience?: string;
}

export interface TemplateSection {
  section_id: number;
  template_id: number;
  section_type: string;
  section_name: string;
  display_order: number;
  fields?: TemplateSectionField[];
}

export interface TemplateSectionField {
  field_id: number;
  section_id: number;
  field_name: string;
  field_type: string;
  is_required: boolean;
  placeholder?: string;
}

// Resume Types
export interface Resume {
  resume_id: number;
  user_id: number;
  template_id?: number;
  title: string;
  json_content: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  template_name?: string;
  thumbnail_url?: string;
  sections?: ResumeSection[];
}

export interface ResumeSection {
  section_id: number;
  resume_id: number;
  section_type: string;
  section_title: string;
  content: string;
  display_order: number;
}

// AI Enhancement Types
export interface AIEnhancement {
  enhancement_id: number;
  user_id: number;
  resume_id: number;
  section_id: number;
  original_text: string;
  enhanced_text: string;
  enhancement_type: string;
  tone_suggestion: string;
  created_at: string;
}

// ATS Score Types
export interface ATSScore {
  overall_score: number;
  criteria: {
    keywords: number;
    readability: number;
    structure: number;
    action_verbs: number;
    metrics: number;
  };
  feedback: string[];
}

// Cover Letter Types
export interface CoverLetter {
  cover_letter_id: number;
  user_id: number;
  resume_id: number;
  template_id?: number;
  title: string;
  content: string;
  created_at: string;
}

// Market Data Types
export interface MarketData {
  id: number;
  skill: string;
  industry: string;
  region: string;
  demand_percentage: number;
  trend: 'up' | 'down' | 'stable';
}

// Payment Types
export interface Payment {
  payment_id: number;
  user_id: number;
  amount: number;
  currency: string;
  mpesa_code?: string; // Optional for backward compatibility
  payment_type: string;
  item_id: number;
  status: string;
  created_at: string;
  // New M-Pesa fields
  checkout_request_id?: string;
  merchant_request_id?: string;
  phone_number?: string;
  completed_at?: string;
  failure_reason?: string;
  updated_at?: string;
}

export interface MpesaPaymentRequest {
  amount: number;
  item_type: 'resume' | 'cover_letter' | 'premium';
  item_id: number;
  phone: string;
}

export interface MpesaPaymentResponse {
  success: boolean;
  payment_id: number;
  checkout_request_id: string;
  merchant_request_id: string;
  message: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  status: string;
  amount: number;
  payment_type: string;
  mpesa_receipt?: string;
  phone_number?: string;
  completed_at?: string;
}

export interface PaymentHistoryItem {
  payment_id: number;
  amount: number;
  currency: string;
  payment_type: string;
  status: string;
  created_at: string;
  item_id: number;
  mpesa_code?: string;
  checkout_request_id?: string;
  phone_number?: string;
  completed_at?: string;
}

export interface PaymentStats {
  totalRevenue: number;
  totalPayments: number;
  payments30d: number;
  payments7d: number;
  payments24h: number;
  avgPaymentAmount: number;
  maxPaymentAmount: number;
  minPaymentAmount: number;
  paymentTypeStats: Record<string, number>;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  paymentStatusStats: Record<string, number>;
  recentPayments: PaymentHistoryItem[];
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ResumeForm {
  title: string;
  template_id?: number;
}

export interface PaymentForm {
  amount: number;
  item_type: string;
  item_id: number;
  phone: string;
}

// Form-First Resume Builder Types
export interface ResumeFormData {
  // Personal Information
  personalInfo: PersonalInfo;
  
  // Content Sections
  resumeObjective?: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  interests?: string;
  references?: Reference[];
  
  // Additional Sections
  certifications?: Certification[];
  languages?: Language[];
  projects?: Project[];
  awards?: Award[];
  
  // Metadata
  resumeTitle: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  zipCode?: string;
  city?: string;
  country?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  drivingLicense?: string;
  gender?: string;
  nationality?: string;
  maritalStatus?: string;
  linkedin?: string;
  website?: string;
  photo?: string;
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  employer: string;
  city: string;
  country: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements?: string[];
  skills?: string[];
}

export interface Education {
  id: string;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  city: string;
  country: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
  description?: string;
  relevantCourses?: string[];
}

export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  yearsOfExperience?: number;
}

export interface Reference {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone?: string;
  relationship: string;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  url?: string;
  highlights: string[];
}

export interface Award {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  description?: string;
}

// Template Application Types
export interface TemplateApplication {
  templateId: number;
  resumeData: ResumeFormData;
  appliedContent: AppliedContent;
  previewUrl?: string;
}

export interface AppliedContent {
  sections: AppliedSection[];
  styling: TemplateStyling;
}

export interface AppliedSection {
  sectionType: string;
  content: string;
  position: SectionPosition;
  styling: SectionStyling;
}

export interface SectionPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SectionStyling {
  fontSize: number;
  fontWeight: string;
  color: string;
  alignment: string;
  fontFamily?: string;
}

export interface TemplateStyling {
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  spacing: number;
}