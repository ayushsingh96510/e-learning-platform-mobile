import api from "../../../api/axios";
import { getRooms } from "../../group-study/api/groupStudy.api";

export const getDashboardStats = async () => {
  const response = await api.get("/dashboard/stats");
  return response.data;
};

export const getRecentLiveClasses = async () => {
  const response = await api.get("/dashboard/live-classes");
  return response.data;
};

export const getRecentContents = async () => {
  const response = await api.get("/dashboard/contents");
  return response.data;
};

export const getRecentGroupStudies = async () => {
  const { rooms } = await getRooms({ page: 1, limit: 50, filter: "ALL" });
  return { data: rooms ?? [] };
};