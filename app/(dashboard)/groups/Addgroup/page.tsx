"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GroupsForm } from "../components/GroupsForm/GroupForm"; 

export default function AddGroupsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);

    try {
      const existingGroups = JSON.parse(localStorage.getItem("mock_groups") || "[]");

     
      const newGroup = {
        ...data,
        id: Math.random().toString(36).substr(2, 9), 
        createdAt: new Date().toISOString()
      };

      const updatedGroups = [newGroup, ...existingGroups];
      localStorage.setItem("mock_groups", JSON.stringify(updatedGroups));
      setTimeout(() => {
        setLoading(false);
        router.push("/groups");
      }, 800);

    } catch (error) {
      console.error("Frontend CRUD Error:", error);
      setLoading(false);
    }
  };

  return <GroupsForm mode="create" onSubmit={handleSubmit} loading={loading} />;
}