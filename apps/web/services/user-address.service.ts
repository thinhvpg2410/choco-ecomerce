import api from "@/services/axios";
import { UserAddress } from "@/types/type";

export interface AddressPayload {
  receiver_name: string;
  receiver_phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
}

export const getAddresses = async (): Promise<UserAddress[]> => {
  const res = await api.get("/user-addresses");
  return res.data?.data || res.data || [];
};

export const createAddress = async (
  payload: AddressPayload,
): Promise<UserAddress> => {
  const res = await api.post("/user-addresses", payload);
  return res.data?.data || res.data;
};

export const updateAddress = async (
  id: string,
  payload: Partial<AddressPayload>,
): Promise<UserAddress> => {
  const res = await api.patch(`/user-addresses/${id}`, payload);
  return res.data?.data || res.data;
};

export const deleteAddress = async (id: string): Promise<void> => {
  await api.delete(`/user-addresses/${id}`);
};


