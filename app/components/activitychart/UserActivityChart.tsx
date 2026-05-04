"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import { apiClient } from "@/app/features/lib/api-client";
import styles from "./UserActivityChart.module.css";

interface RawActivityData {
  staffName?: string;
  action?: string;
  actionCount?: string | number;
}

interface ChartData {
  actionName: string;
  [userName: string]: string | number;
}

type ApiResponse =
  | RawActivityData[]
  | { data?: RawActivityData[] | { data?: RawActivityData[] } };

// 🛑 Top 5 ယောက်အတွက် အရောင်များ
const TOP_USER_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
];
const OTHERS_COLOR = "#94a3b8"; // 🛑 Others အတွက် မီးခိုးရောင် သီးသန့်

export function UserActivityChart({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) {
  const [data, setData] = useState<ChartData[]>([]);
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const queryStr = params.toString() ? `?${params.toString()}` : "";
    apiClient
      .get(`/master-audit/analytics/user-activity${queryStr}`)
      .then((res: unknown) => {
        const response = res as ApiResponse;
        let rawData: RawActivityData[] = [];

        if (Array.isArray(response)) {
          rawData = response;
        } else if (
          response &&
          typeof response === "object" &&
          "data" in response
        ) {
          const resData = response.data;
          if (Array.isArray(resData)) {
            rawData = resData;
          } else if (
            resData &&
            typeof resData === "object" &&
            "data" in resData &&
            Array.isArray(resData.data)
          ) {
            rawData = resData.data as RawActivityData[];
          }
        }

        // ခြေလှမ်း (၁): User တစ်ယောက်ချင်းစီရဲ့ စုစုပေါင်း Action အရေအတွက်ကို အရင်ရှာပါမည်
        const userTotals: Record<string, number> = {};
        rawData.forEach((item) => {
          const action = item.action || "UNKNOWN";
          if (["CREATE", "UPDATE", "DELETE", "RESTORE"].includes(action)) {
            const userName = item.staffName || "Unknown";
            const count = Number(item.actionCount) || 0;
            userTotals[userName] = (userTotals[userName] || 0) + count;
          }
        });

        // ခြေလှမ်း (၂): အများဆုံးလုပ်ထားသော Top 5 ကို စစ်ထုတ်ပါမည်
        const sortedUsers = Object.entries(userTotals).sort(
          (a, b) => b[1] - a[1],
        );
        const top5Users = new Set(sortedUsers.slice(0, 5).map((u) => u[0]));
        const hasOthers = sortedUsers.length > 5;

        // ခြေလှမ်း (၃): Chart အတွက် Data များကို စတင်ထည့်သွင်းပါမည်
        const groupedData: Record<string, ChartData> = {
          CREATE: { actionName: "CREATE" },
          UPDATE: { actionName: "UPDATE" },
          DELETE: { actionName: "DELETE" },
          RESTORE: { actionName: "RESTORE" },
        };

        rawData.forEach((item) => {
          const action = item.action || "UNKNOWN";
          if (["CREATE", "UPDATE", "DELETE", "RESTORE"].includes(action)) {
            let userName = item.staffName || "Unknown";
            const count = Number(item.actionCount) || 0;

            // Top 5 ထဲတွင် မပါလျှင် "Others" အဖြစ် ပြောင်းလဲသတ်မှတ်မည်
            if (!top5Users.has(userName)) {
              userName = "Others";
            }

            groupedData[action][userName] =
              (Number(groupedData[action][userName]) || 0) + count;
          }
        });

        const formattedData = [
          groupedData.CREATE,
          groupedData.UPDATE,
          groupedData.DELETE,
          groupedData.RESTORE,
        ];

        // Bar များဆွဲရန် User နာမည်စရင်း (Top 5 + Others) ကို သတ်မှတ်မည်
        const activeUserList = Array.from(top5Users);
        if (hasOthers) {
          activeUserList.push("Others");
        }

        setData(formattedData);
        setUsers(activeUserList);
      })
      .catch((err) => console.error("Error fetching chart data:", err));
  }, [startDate, endDate, setData, setUsers]);

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Action Breakdown (Top 5 Users vs Others)</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border-color)"
            />
            <XAxis dataKey="actionName" tick={{ fill: "var(--text-main)" }} />
            <YAxis allowDecimals={false} tick={{ fill: "var(--text-main)" }} />
            <Tooltip
              cursor={{ fill: "var(--bg-row-hover)" }}
              contentStyle={{
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-main)",
                borderColor: "var(--border-color)",
              }}
            />

            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ color: "var(--text-main)" }}
            />

            {/* User အလိုက် Bar များကို ဆွဲပေးခြင်း */}
            {users.map((userName, index) => (
              <Bar
                key={userName}
                dataKey={userName}
                stackId="a"
                // "Others" ဖြစ်လျှင် မီးခိုးရောင်သုံးပြီး၊ ကျန်သူများကို Top Colors သုံးပါမည်
                fill={
                  userName === "Others"
                    ? OTHERS_COLOR
                    : TOP_USER_COLORS[index % TOP_USER_COLORS.length]
                }
                barSize={40}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
