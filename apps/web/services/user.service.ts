import api from "@/services/axios";
import { User } from "@/types/type";
export interface UpdateUserPayload {
  username?: string;
  phone?: string;
  dob?: string;
  gender?: "male" | "female" | "other";
  avatar_url?: string;
}

export const getMe = async (): Promise<User> => {
  const res = await api.get("/users/me");
  return res.data.data;
};

export const updateMe = async (payload: UpdateUserPayload): Promise<User> => {
  const res = await api.patch("/users/me", payload);
  return res.data.data;
};

export const uploadAvatar = async (file: File): Promise<User> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/users/me/avatar", formData);

  return res.data.data;
};

export const deleteMe = async (): Promise<void> => {
  await api.delete("/users/me");
};
