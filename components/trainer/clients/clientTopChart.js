import React from "react";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function ClientTopChart() {
  // Mock data for multiple metrics
  const chartData = {
    series: [
      {
        name: "Weight (lbs)",
        data: [185, 183, 181, 179, 177, 175, 173, 171, 169, 167, 165, 163],
        color: "#10b981", // green
      },
      {
        name: "Body Fat %",
        data: [
          22, 21.5, 21, 20.8, 20.3, 19.9, 19.5, 19.1, 18.8, 18.4, 18.0, 17.6,
        ],
        color: "#3b82f6", // blue
      },
      {
        name: "Muscle Mass (lbs)",
        data: [145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156],
        color: "#f59e0b", // amber
      },
      {
        name: "Calories Burned",
        data: [
          2100, 2250, 2180, 2340, 2280, 2420, 2380, 2500, 2460, 2580, 2540,
          2620,
        ],
        color: "#ef4444", // red
      },
    ],
    options: {
      chart: {
        type: "line",
        height: 300,
        background: "transparent",
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
        },
      },
      theme: {
        mode: "dark",
      },
      stroke: {
        width: 3,
        curve: "smooth",
      },
      grid: {
        show: true,
        borderColor: "#374151",
        strokeDashArray: 3,
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        labels: {
          style: {
            colors: "#9ca3af",
            fontSize: "12px",
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#9ca3af",
            fontSize: "12px",
          },
        },
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "right",
        labels: {
          colors: "#e5e7eb",
        },
        markers: {
          width: 8,
          height: 8,
          radius: 4,
        },
      },
      tooltip: {
        theme: "dark",
        style: {
          fontSize: "12px",
        },
        x: {
          show: true,
        },
        y: {
          formatter: function (value, { seriesIndex }) {
            const units = ["lbs", "%", "lbs", "kcal"];
            return `${value} ${units[seriesIndex] || ""}`;
          },
        },
      },
      markers: {
        size: 0,
        hover: {
          size: 6,
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          type: "vertical",
          shadeIntensity: 0,
          gradientToColors: undefined,
          inverseColors: false,
          opacityFrom: 0.1,
          opacityTo: 0,
          stops: [0, 100],
        },
      },
    },
  };

  return (
    <div className="w-full bg-zinc-900/50 rounded-lg p-6 backdrop-blur-sm border border-zinc-800">
      <div className="mb-4">
        <h3 className="text-white text-lg font-semibold mb-1">
          Client Progress Overview
        </h3>
        <p className="text-zinc-400 text-sm">
          Track key metrics over the past 12 months
        </p>
      </div>

      <div className="w-full">
        <Chart
          options={chartData.options}
          series={chartData.series}
          type="line"
          height={300}
        />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-zinc-800">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">-22</div>
          <div className="text-xs text-zinc-400">lbs lost</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">-4.4</div>
          <div className="text-xs text-zinc-400">% body fat</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-400">+11</div>
          <div className="text-xs text-zinc-400">lbs muscle</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">2.6k</div>
          <div className="text-xs text-zinc-400">avg calories</div>
        </div>
      </div>
    </div>
  );
}
