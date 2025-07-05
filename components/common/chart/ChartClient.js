// components/ChartClientOnly.js
"use client";
import Chart from "react-apexcharts";
import React from "react";

const ChartClient = ({ options, series, type = "line", height = 60 }) => {
  return (
    <Chart options={options} series={series} type={type} height={height} />
  );
};

export default ChartClient;
