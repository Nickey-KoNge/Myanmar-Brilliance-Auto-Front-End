"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  VehicleModelForm,
  VehicleModelFormData,
} from "../components/VehicleModelsForm/VehicleModelsForm"; // သင်ဖန်တီးထားမည့် Form Component
import { apiClient } from "@/app/features/lib/api-client";

export default function AddVehicleModelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSave = async (data: VehicleModelFormData) => {
    setLoading(true);
    try {
      // Vehicle Model သည် Driver ကဲ့သို့ image upload မပါသောကြောင့်
      // FormData အစား JSON object အနေဖြင့် တိုက်ရိုက် ပို့ပေးရပါမည်။

      const payload = {
        ...data,
        // လိုအပ်ပါက status သို့မဟုတ် အခြား default value များ ထည့်သွင်းနိုင်သည်
        status: data.status || "Active",
      };

      // Backend Controller ၏ @Post('register') သို့ ပို့ခြင်း
      await apiClient.post("/vehicle-model/register", payload);

      // အောင်မြင်ပါက List view သို့ ပြန်သွားမည်
      router.push("/vehicle-model");
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        "An error occurred while saving the model.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VehicleModelForm mode="create" onSubmit={handleSave} loading={loading} />
  );
}
