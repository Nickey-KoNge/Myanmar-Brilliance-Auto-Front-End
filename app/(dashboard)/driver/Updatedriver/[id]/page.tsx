"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  DriverForm,
  DriverFormData,
} from "../../components/DriverForm/DriverForm";
import { apiClient } from "@/app/features/lib/api-client";

interface DriverApiResponse {
  id?: string;
  driver_name?: string;
  nrc?: string;
  phone?: string;
  station_id?: string;
  station?: { id: string; station_name?: string };
  dob?: string;
  gender?: string;
  city?: string;
  country?: string;
  address?: string;
  join_date?: string;
  license_no?: string;
  license_type?: string;
  license_expiry?: string;
  driving_exp?: string;
  deposits?: string;
  image?: string;
  status?: string;
  credential_email?: string;
  email?: string;
  credential_id?: { id: string; email?: string } | string;
}

export default function EditDriverPage() {
  const router = useRouter();
  const { id } = useParams();

  const [initialData, setInitialData] =
    useState<Partial<DriverFormData> | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const res = await apiClient.get(`/master-company/driver/${id}`);
        const d = res as unknown as DriverApiResponse;

        if (d && d.id) {
          let fetchedEmail = d.email ?? d.credential_email ?? "";
          if (
            !fetchedEmail &&
            typeof d.credential_id === "object" &&
            d.credential_id?.email
          ) {
            fetchedEmail = d.credential_id.email;
          }

          setInitialData({
            driver_name: d.driver_name ?? "",
            nrc: d.nrc ?? "",
            phone: d.phone ?? "",
            station_id: d.station_id ?? d.station?.id ?? "",
            dob: d.dob ? d.dob.split("T")[0] : "",
            gender: d.gender ?? "",
            city: d.city ?? "",
            country: d.country ?? "",
            address: d.address ?? "",
            join_date: d.join_date ? d.join_date.split("T")[0] : "",
            license_no: d.license_no ?? "",
            license_type: d.license_type ?? "",
            license_expiry: d.license_expiry
              ? d.license_expiry.split("T")[0]
              : "",
            driving_exp: d.driving_exp ?? "",
            deposits: d.deposits ?? "",
            image: d.image ?? "", // Pass existing image URL for preview
            email: fetchedEmail,
          });
        }
      } catch (error) {
        console.error("Error fetching driver:", error);
        alert("Failed to load driver data");
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchDriverData();
  }, [id]);

  const handleUpdate = async (data: DriverFormData) => {
    setLoading(true);
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === "id" || key === "image") return;

        if (key === "photo") {
          if (value?.[0]) formData.append("image", value[0] as Blob);
        } else if (key === "password") {
          if (value) formData.append("password", value as string);
        } else if (
          ["dob", "license_expiry", "join_date"].includes(key) &&
          value
        ) {
          formData.append(key, new Date(value as string).toISOString());
        } else if (value !== "" && value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      await apiClient.patch(`/master-company/driver/${id}`, formData);

      alert("Updated Successfully!");
      router.push("/driver");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg = err?.response?.data?.message || "Update Failed";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return <div style={{ padding: "2rem" }}>Loading driver data...</div>;
  if (!initialData)
    return <div style={{ padding: "2rem" }}>Error loading data.</div>;

  return (
    <DriverForm
      mode="update"
      initialData={initialData}
      onSubmit={handleUpdate}
      loading={loading}
    />
  );
}
