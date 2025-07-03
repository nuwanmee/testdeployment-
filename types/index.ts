export interface Feature {
    icon: string;
    title: string;
    description: string;
  }
  
  export interface Testimonial {
    id: number;
    content: string;
    name: string;
    role: string;
    image: string;
  }
  
  export interface PricingPlan {
    name: string;
    price: string;
    duration: string;
    features: string[];
    featured: boolean;
  }
  
  export interface NavLink {
    name: string;
    link: string;
  }

export type ProfileStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Optionally export a validation function
export function isProfileStatus(status: string): status is ProfileStatus {
  return ['PENDING', 'APPROVED', 'REJECTED'].includes(status);
}  

