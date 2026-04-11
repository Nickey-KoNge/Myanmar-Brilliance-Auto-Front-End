// src/components/alert/AlertListener.tsx
"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

export default function AlertListener() {
  useEffect(() => {
    const socket = io("http://localhost:3001");

    socket.on("securityAlert", (payload) => {
      toast.error(payload.message, { duration: 5000 });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return null;
}
