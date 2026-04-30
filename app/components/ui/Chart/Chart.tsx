"use client";

import React, { useEffect, useRef, useState } from "react";
import { Chart } from "react-google-charts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

type ChartType = "ColumnChart" | "LineChart" | "PieChart";

type Props = {
  type: ChartType;
  data: any[];
  title?: string;
  icon?: IconDefinition;
  height?: number | string;
};

export default function ReactGoogleChart({
  type,
  data,
  title,
  icon,
  height = "100%",
}: Props) {
  const baseOptions = {
    backgroundColor: "transparent",
    chartArea: {
      width: "85%",
      height: "65%",
    },
    legend: {
      position: "bottom",
      textStyle: { fontSize: 12, color: "#888888" },
    },
    tooltip: {
      trigger: "focus",
    },
  };

  const chartOptionsMap: Record<ChartType, any> = {
    ColumnChart: {
      ...baseOptions,
      colors: ["#602424", "#c24646"],
      bar: { groupWidth: "55%" },
      hAxis: {
        textStyle: { fontSize: 11, color: "#888888" },
      },
      vAxis: {
        textStyle: { fontSize: 11, color: "#888888" },
        gridlines: { color: "#333" },
        format: "short",
      },
    },

    LineChart: {
      ...baseOptions,
      colors: ["#c24646"],
      curveType: "function",
      lineWidth: 3,
      pointSize: 4,
      hAxis: {
        textStyle: { fontSize: 11, color: "#888888" },
      },
      vAxis: {
        gridlines: { color: "#333" },
        textStyle: { color: "#888888" },
        format: "short",
      },
    },

    PieChart: {
      ...baseOptions,
      pieHole: 0.6,
      legend: {
        position: "right",
        textStyle: { color: "#ccc" },
      },
      colors: ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"],
    },
  };

  // Chart Responsive Logic
  const [key, setKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let timeout: NodeJS.Timeout;

    const observer = new ResizeObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 100);
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: typeof height === "number" ? `${height}px` : height,
        display: "flex",
        flexDirection: "column",
        background: "transparent",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      {(title || icon) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
            color: `var(--text-main)`,
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          {/* Title */}
          <div>{title}</div>

          {/* Icon */}
          {icon && (
            <FontAwesomeIcon
              icon={icon}
              style={{
                fontSize: "24px",
                color: `var(--color-primary)`,
              }}
            />
          )}
        </div>
      )}

      {/* Chart */}
      <div style={{ flex: 1, minHeight: 0, width: "100%" }}>
        <Chart
          key={key}
          chartType={type}
          data={data}
          width="100%"
          height="100%"
          options={{
            ...chartOptionsMap[type],
            chartArea: {
              ...chartOptionsMap[type].chartArea,
              width: "90%",
              height: "70%",
            },
          }}
          loader={<div>Loading...</div>}
        />
      </div>
    </div>
  );
}
