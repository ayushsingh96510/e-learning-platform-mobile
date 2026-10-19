export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";

export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface Address {
  line1?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface PersonalInfo {
  name?: string;
  dateOfBirth?: string;
  gender?: Gender | string;
  profileImage?: string;
  address?: Address;
}

export interface StudentRoleInfo {
  rollNumber?: string;
  admissionDate?: string;
  guardianName?: string;
  guardianPhoneNumber?: string;
  batch?: {
    id?: string;
    name?: string;
  };
  program?: {
    id?: string;
    name?: string;
  };
}

export interface Profile {
  id: string;
  email: string;
  phoneNumber?: string;
  role: UserRole | string;
  status?: UserStatus | string;
  personalInfo?: PersonalInfo;
  roleInfo?: StudentRoleInfo;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Profile;
  errors?: string[];
}
