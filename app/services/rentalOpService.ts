import { apiClient } from "../features/lib/api-client";

export const getRentalOperations = async (params = {}) => {
  // 🛑 apiClient က data တိုက်ရိုက်ထုတ်ပေးပြီးသားဖြစ်လို့ .data ထပ်မခေါ်တော့ပါ
  const response = await apiClient.get("/master-rental/rental-operation", {
    params,
  });
  return response;
};

export const generateRentalOps = async (stationId: string, routeId: string) => {
  const response = await apiClient.post(
    "/master-rental/rental-operation/generate-by-station",
    {
      station_id: stationId,
      route_id: routeId,
    },
  );
  return response;
};
