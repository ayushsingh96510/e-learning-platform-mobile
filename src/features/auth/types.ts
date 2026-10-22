export interface User {
  id: string;
  email: string;
  role: string;
  phoneNumber?: string;
  status?: string;
  personalInfo?: {
    name?: string;
    profileImage?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: {
      line1?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
  };
  roleInfo?: {
    rollNumber?: string;
    admissionDate?: string;
    guardianName?: string;
    guardianPhoneNumber?: string;
    batch?: { id?: string; name?: string };
    program?: { id?: string; name?: string };
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResult {
  success: boolean;
  message?: string;
}