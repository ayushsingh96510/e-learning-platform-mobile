import api from "../../../api/axios";

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface ForgotPasswordResponse {
  success?: boolean;
  message?: string;
  data?: {
    message?: string;
  };
}

export const loginRequest = async (
  email: string,
  password: string,
) => {
  const response = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};

export const forgotPasswordRequest = async (
  email: string,
): Promise<ForgotPasswordResponse> => {
  const response = await api.post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    { email: email.trim().toLowerCase() },
  );

  return response.data;
};
