import api from "../../../api/axios";
import type { ProfileApiResponse } from "../types/profile.types";

export const getProfile = async () => {
  const response = await api.get<ProfileApiResponse>("/auth/me");

  if (!response.data.success) {
    throw new Error(response.data.message || "Unable to load profile.");
  }

  return response.data.data;
};
