export interface SocialMedia {
  name: string;
  url: string;
}

export interface Project {
  title: string;
  description: string;
  image: string;
  github: string;
  order?: number;
}

export interface PortfolioData {
  fullName: string;
  title: string;
  shortBio: string;
  profilePicture: string;
  detailedBio: string;
  skills: string[];
  projects: Project[];
  socialMedia: SocialMedia[];
}

export interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
  portfolioId?: number;
}
