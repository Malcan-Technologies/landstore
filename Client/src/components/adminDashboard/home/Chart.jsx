"use client";

import { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";
import ChartComboBox from "@/components/adminDashboard/home/ChartComboBox";
import TrendingUp from "@/components/svg/TrendingUp";

const comboOptions = ["12 months", "30 days", "7 days", "24 hours"];

const buildOptions = (seriesName, seriesData, categories) => ({
  chart: {
    type: "line",
    height: 260,
    toolbar: { show: false },
    zoom: { enabled: false },
    parentHeightOffset: 0,
  },
  series: [{ name: seriesName, data: seriesData }],
  xaxis: {
    categories,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: "#298064", fontSize: "11px" } },
  },
  yaxis: {
    labels: { style: { colors: "#298064", fontSize: "11px" } },
  },
  grid: {
    borderColor: "#E5E7EB",
    strokeDashArray: 4,
    yaxis: { lines: { show: true } },
    xaxis: { lines: { show: false } },
  },
  stroke: { curve: "smooth", width: 3, colors: ["#298064"] },
  dataLabels: { enabled: false },
  tooltip: { theme: "light", x: { show: true } },
  colors: ["#298064"],
});

const Chart = ({
  title = "User growth over time",
  seriesName = "Value",
  series = [],
  categories = [],
  timeRange = "12 months",
  onTimeRangeChange,
  isLoading = false,
  trendPercent = null,
}) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const options = buildOptions(seriesName, series, categories);

    if (chartInstanceRef.current) {
      chartInstanceRef.current.updateOptions(options, true, true);
    } else {
      chartInstanceRef.current = new ApexCharts(chartRef.current, options);
      chartInstanceRef.current.render();
    }

    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, [seriesName, series, categories]);

  return (
    <div className="flex flex-col justify-between w-full h-full gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] sm:text-[16px] font-semibold text-gray2">{title}</h2>
      </div>

      <div className="flex w-full justify-between items-center">
        <ChartComboBox
          options={comboOptions}
          selectedValue={timeRange}
          onChange={onTimeRangeChange}
        />
        {trendPercent !== null ? (
          <span className="inline-flex items-center gap-1 border border-border-card rounded-lg px-1.5 py-0.5 text-[11px] font-semibold sm:text-[12px]">
            <TrendingUp />
            <span>{trendPercent}</span>
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex h-[260px] items-center justify-center text-sm text-gray5">Loading…</div>
      ) : (
        <div ref={chartRef} className="w-full h-[260px]" />
      )}
    </div>
  );
};

export default Chart;
