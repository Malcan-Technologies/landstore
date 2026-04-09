"use client";

import { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";

const DEFAULT_COLORS = ["#298064", "#339978", "#3DB58E", "#CFCFCF"];

const EntityDonutChart = ({
  series = [42, 28, 18, 12],
  labels = ["Individual", "Company", "Koperasi", "Unspecified"],
  colors = DEFAULT_COLORS,
  totalLabel = "Total users",
  height = 150,
}) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const total = series.reduce((sum, value) => sum + value, 0);

  useEffect(() => {
    if (!chartRef.current) return;

    const options = {
      chart: {
        type: "donut",
        height: height,
        toolbar: { show: false },
      },
      series,
      labels,
      colors,
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 0,
      },
      legend: {
        show: false,
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: "60%",
            labels: {
              show: false,
              name: {
                show: true,
                offsetY: 12,
                color: "#838383",
                fontSize: "10px",
                fontWeight: 500,
              },
              value: {
                show: true,
                offsetY: -15,
                color: "#18181B",
                fontSize: "18px",
                fontWeight: 700,
                formatter: () => `${total}`,
              },
              total: {
                show: true,
                label: totalLabel,
                offsetY: 18,
                color: "#838383",
                fontSize: "10px",
                fontWeight: 500,
                formatter: () => `${total}`,
              },
            },
          },
        },
      },
      tooltip: {
        y: {
          formatter: (value) => `${value} users`,
        },
      },
      states: {
        hover: {
          filter: {
            type: "none",
          },
        },
        active: {
          filter: {
            type: "none",
          },
        },
      },
    };

    chartInstanceRef.current = new ApexCharts(chartRef.current, options);
    chartInstanceRef.current.render();

    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, [colors, labels, series, total, totalLabel]);

  return (
    <div className="flex justify-center">
      <div ref={chartRef} className="w-full max-w-[150px]" />
    </div>
  );
};

export default EntityDonutChart;
