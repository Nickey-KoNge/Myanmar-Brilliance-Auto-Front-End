"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { StaffForm, StaffFormData } from "../../components/StaffForm/StaffForm";
import { apiClient } from "@/app/features/lib/api-client";

interface StaffApiResponse {
  id?: string;
  staffName?: string;
  phone?: string;
  nrc?: string;
  position?: string;
  image?: string;
  status?: string;
  city?: string;
  country?: string;
  street_address?: string;
  dob?: string;
  gender?: string;
  credential?: {
    id: string;
    email: string;
  };
  company?: {
    id: string;
    company_name?: string;
  };
  branch?: {
    id: string;
    branches_name?: string;
  };
  role?: {
    id: string;
    role_name?: string;
  };

  role_id?: string;
  branch_id?: string;
  company_id?: string;
  email?: string;
}

export default function EditStaffPage() {
  const { id } = useParams();
  const router = useRouter();

  const [initialData, setInitialData] = useState<Partial<StaffFormData> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const res = await apiClient.get(`/master-company/staff/${id}`);

        const s = res as unknown as StaffApiResponse;
        console.log("Response result:", s);

        if (s && s.id) {
          setInitialData({
            role: s.role_id ?? s.role?.id ?? "",
            branch: s.branch_id ?? s.branch?.id ?? "",
            company: s.company_id ?? s.company?.id ?? "",
            position: s.position ?? "",
            staffName: s.staffName ?? "",
            nrc: s.nrc ?? "",
            dob: s.dob ? s.dob.split("T")[0] : "",
            gender: s.gender ?? "",
            phone: s.phone ?? "",
            email: s.email ?? s.credential?.email ?? "",
            country: s.country ?? "",
            city: s.city ?? "",
            street_address: s.street_address ?? "",
            image: s.image ?? "", // Pass existing image URL for preview
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchStaffData();
  }, [id]);

  const handleSubmit = async (data: StaffFormData) => {
    setLoading(true);
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === "id" || key === "image") return;

        if (key === "photo") {
          // File List ရဲ့ ပထမဆုံး ပုံကို ထည့်တယ်
          if (value?.[0]) formData.append("image", value[0] as Blob);
        } else if (key === "password") {
          // Password အသစ်ထည့်ထားရင်ပဲ ပို့မယ်
          if (value) formData.append("password", value as string);
        } else if (key === "dob" && value) {
          formData.append(key, new Date(value as string).toISOString());
        } else if (value !== "" && value !== null && value !== undefined) {
          formData.append(key, value as string);
        }
      });

      await apiClient.patch(`/master-company/staff/${id}`, formData);

      router.push("/staff");
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unexpected error occurred while updating the staff record.");
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div>Loading record...</div>;
  if (!initialData) return <div>Error loading data.</div>;

  return (
    <StaffForm
      mode="update"
      initialData={initialData}
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}
