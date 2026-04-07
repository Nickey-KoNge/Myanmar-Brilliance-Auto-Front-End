// src/components/activitychart/ActionTypePieChart.tsx
"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import { apiClient } from "@/app/features/lib/api-client";
import styles from "./ActionTypePieChart.module.css";

const COLORS = ["#22c55e", "#3b82f6", "#ef4444", "#f59e0b"]; // CREATE, UPDATE, DELETE, RESTORE

// 🛑 TypeScript Error မတက်စေရန် Interface များ ထပ်ထည့်ပေးထားပါသည်
interface RawActionData {
  action?: string;
  actionCount?: string | number;
}

interface ChartData {
  name: string;
  value: number;
}

type ApiResponse =
  | RawActionData[]
  | { data?: RawActionData[] | { data?: RawActionData[] } };

export function ActionTypePieChart({
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
      .get(`/master-audit/analytics/action-types${queryStr}`) // 🛑 Query တွဲပို့ပါမည်
      .then((res: unknown) => {
        const response = res as ApiResponse;
        let rawData: RawActionData[] = [];

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
            rawData = resData.data as RawActionData[];
          }
        }

        const formattedData: ChartData[] = rawData.map((item) => ({
          name: item.action || "UNKNOWN",
          value: Number(item.actionCount) || 0,
        }));

        setData(formattedData);
      })
      .catch((err) => console.error("Error fetching pie chart data:", err));
  }, [startDate, endDate]); // 🛑 Date ပြောင်းတိုင်း Data ပြန်ခေါ်ပါမည်

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Action Distribution</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          {data.length > 0 ? (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-card)",
                  color: "var(--text-main)",
                  borderColor: "var(--border-color)",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ color: "var(--text-main)" }}
              />
            </PieChart>
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