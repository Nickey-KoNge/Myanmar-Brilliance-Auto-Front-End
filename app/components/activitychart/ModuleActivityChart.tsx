// src/components/activitychart/ModuleActivityChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import { apiClient } from "@/app/features/lib/api-client";
import styles from "./ModuleActivityChart.module.css";

interface RawModuleData {
  entity_name?: string;
  actionCount?: string | number;
}

interface ChartData {
  moduleName: string;
  actions: number;
}

type ApiResponse =
  | RawModuleData[]
  | { data?: RawModuleData[] | { data?: RawModuleData[] } };

export function ModuleActivityChart({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) {
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    // 🛑 Start Date နှင့် End Date များကို Query Parameter အဖြစ် တည်ဆောက်ခြင်း
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const queryStr = params.toString() ? `?${params.toString()}` : "";

    apiClient
      .get(`/master-audit/analytics/module-activity${queryStr}`) // 🛑 Query တွဲပို့ပါမည်
      .then((res: unknown) => {
        const response = res as ApiResponse;
        let rawData: RawModuleData[] = [];

        if (Array.isArray(response)) {
          rawData = response;
        } else if (
          response &&
          typeof response === "object" &&
          "data" in response
        ) {
          const resData = response.data;
          if (Array.isArray(resData)) rawData = resData;
          else if (
            resData &&
            typeof resData === "object" &&
            "data" in resData &&
            Array.isArray(resData.data)
          ) {
            rawData = resData.data as RawModuleData[];
          }
        }

        const formattedData: ChartData[] = rawData.map((item) => ({
          moduleName: item.entity_name
            ? item.entity_name.charAt(0).toUpperCase() +
              item.entity_name.slice(1)
            : "Unknown",
          actions: Number(item.actionCount) || 0,
        }));

        setData(formattedData);
      })
      .catch((err) => console.error("Error fetching module chart data:", err));
  }, [startDate, endDate]); // 🛑 Date ပြောင်းတိုင်း Data ပြန်ခေါ်ပါမည်

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Activity by Record Type</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          {data.length > 0 ? (
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border-color)"
              />
              <XAxis dataKey="moduleName" tick={{ fill: "var(--text-main)" }} />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--text-main)" }}
              />
              <Tooltip
                cursor={{ fill: "var(--bg-row-hover)" }}
                contentStyle={{
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-main)",
                  borderColor: "var(--border-color)",
                }}
              />
              <Bar
                dataKey="actions"
                fill="#14b8a6"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
              No data available
            </div>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
