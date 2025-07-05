import React, { useState, useCallback, useRef, useEffect } from "react";
import { LinePath, AreaClosed } from "@visx/shape";
import { Group } from "@visx/group";
import { scaleTime, scaleLinear } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { curveMonotoneX } from "@visx/curve";
import { LegendOrdinal } from "@visx/legend";
import { scaleOrdinal } from "@visx/scale";
import { localPoint } from "@visx/event";
import { useTooltip, TooltipWithBounds, defaultStyles } from "@visx/tooltip";
import { bisector } from "d3-array";

export default function ClientTopChart() {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 350 });

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  // Update dimensions when container resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: width || 800, // Use full container width, fallback to 800
          height: 350,
        });
      }
    };

    // Initial measurement
    updateDimensions();

    // Update on window resize
    window.addEventListener("resize", updateDimensions);

    // Update when component mounts (for proper initial sizing)
    const timer = setTimeout(updateDimensions, 100);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      clearTimeout(timer);
    };
  }, []);

  // Bisector for finding the closest data point
  const bisectDate = bisector((d) => d.date).left;
  // Mock data with extreme variation and realistic fitness journey patterns
  const data = [
    {
      month: "Jan",
      date: new Date(2024, 0, 1),
      weight: 195,
      bodyFat: 28.2,
      muscle: 135,
      endurance: 32,
    },
    {
      month: "Feb",
      date: new Date(2024, 1, 1),
      weight: 201,
      bodyFat: 30.1,
      muscle: 132,
      endurance: 28,
    },
    {
      month: "Mar",
      date: new Date(2024, 2, 1),
      weight: 189,
      bodyFat: 26.8,
      muscle: 138,
      endurance: 45,
    },
    {
      month: "Apr",
      date: new Date(2024, 3, 1),
      weight: 183,
      bodyFat: 24.5,
      muscle: 142,
      endurance: 62,
    },
    {
      month: "May",
      date: new Date(2024, 4, 1),
      weight: 178,
      bodyFat: 21.9,
      muscle: 148,
      endurance: 78,
    },
    {
      month: "Jun",
      date: new Date(2024, 5, 1),
      weight: 185,
      bodyFat: 23.4,
      muscle: 145,
      endurance: 71,
    },
    {
      month: "Jul",
      date: new Date(2024, 6, 1),
      weight: 174,
      bodyFat: 19.8,
      muscle: 152,
      endurance: 89,
    },
    {
      month: "Aug",
      date: new Date(2024, 7, 1),
      weight: 171,
      bodyFat: 18.2,
      muscle: 156,
      endurance: 95,
    },
    {
      month: "Sep",
      date: new Date(2024, 8, 1),
      weight: 177,
      bodyFat: 19.7,
      muscle: 154,
      endurance: 88,
    },
    {
      month: "Oct",
      date: new Date(2024, 9, 1),
      weight: 169,
      bodyFat: 16.9,
      muscle: 161,
      endurance: 102,
    },
    {
      month: "Nov",
      date: new Date(2024, 10, 1),
      weight: 165,
      bodyFat: 15.2,
      muscle: 167,
      endurance: 118,
    },
    {
      month: "Dec",
      date: new Date(2024, 11, 1),
      weight: 172,
      bodyFat: 17.8,
      muscle: 163,
      endurance: 106,
    },
  ];

  // Chart dimensions - truly responsive to container width
  const width = dimensions.width;
  const height = dimensions.height;
  const margin = { top: 20, right: 0, bottom: 40, left: 0 }; // Remove left/right margins
  const xMax = Math.max(width - margin.left - margin.right, 0);
  const yMax = height - margin.top - margin.bottom;

  // Scales
  const xScale = scaleTime({
    range: [0, xMax],
    domain: [data[0].date, data[data.length - 1].date],
  });

  const yScale = scaleLinear({
    range: [yMax, 0],
    domain: [
      0,
      Math.max(...data.map((d) => Math.max(d.weight, d.muscle, d.endurance))),
    ],
  });

  // Series configuration - all lines green
  const series = [
    { key: "weight", color: "#10b981", name: "Weight (lbs)" },
    { key: "bodyFat", color: "#10b981", name: "Body Fat (%)" },
    { key: "muscle", color: "#10b981", name: "Muscle (lbs)" },
    { key: "endurance", color: "#10b981", name: "Endurance" },
  ];

  // Legend scale
  const legendScale = scaleOrdinal({
    domain: series.map((s) => s.name),
    range: series.map((s) => s.color),
  });

  // Tooltip styles
  const tooltipStyles = {
    ...defaultStyles,
    background: "rgba(0, 0, 0, 0.9)",
    border: "1px solid #374151",
    color: "white",
    borderRadius: "4px",
  };

  // Handle mouse move for tooltip
  const handleTooltip = useCallback(
    (event) => {
      const { x } = localPoint(event) || { x: 0 };
      const x0 = xScale.invert(x - margin.left);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      let d = d0;
      if (d1 && d0) {
        d =
          x0.valueOf() - d0.date.valueOf() > d1.date.valueOf() - x0.valueOf()
            ? d1
            : d0;
      }
      showTooltip({
        tooltipData: d,
        tooltipLeft: x,
        tooltipTop: yScale(d.weight),
      });
    },
    [showTooltip, xScale, yScale, data, margin.left]
  );

  return (
    <div className="flex flex-col justify-between w-full bg-zinc-900/50 rounded-lg backdrop-blur-sm border border-zinc-800">
      <div className="px-6 pt-6 pb-4">
        <h3 className="text-white text-lg font-semibold mb-1">
          Client Progress Overview
        </h3>
        <p className="text-zinc-400 text-sm">
          Track key metrics over the past 12 months
        </p>
      </div>

      <div
        ref={containerRef}
        className="w-full relative"
        style={{ padding: 0, margin: 0 }}
      >
        <svg
          width={width}
          height={height}
          className="w-full block"
          style={{ padding: 0, margin: 0, display: "block" }}
        >
          {/* Define gradients for each line */}
          <defs>
            {series.map((s, index) => (
              <linearGradient
                key={s.key}
                id={`gradient-${s.key}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity="0.6" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0.1" />
              </linearGradient>
            ))}
          </defs>

          <rect
            width={width}
            height={height}
            fill="transparent"
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
          />
          <Group left={margin.left} top={margin.top}>
            {/* Grid */}
            <GridRows
              scale={yScale}
              width={xMax}
              height={yMax}
              stroke="#374151"
              strokeOpacity={0.3}
            />
            <GridColumns
              scale={xScale}
              width={xMax}
              height={yMax}
              stroke="#374151"
              strokeOpacity={0.3}
            />

            {/* Area fills with gradient */}
            {series.map((s) => (
              <AreaClosed
                key={`area-${s.key}`}
                data={data}
                x={(d) => xScale(d.date)}
                y={(d) => yScale(d[s.key])}
                yScale={yScale}
                strokeWidth={0}
                fill={`url(#gradient-${s.key})`}
                curve={curveMonotoneX}
              />
            ))}

            {/* Lines */}
            {series.map((s) => (
              <LinePath
                key={s.key}
                curve={curveMonotoneX}
                data={data}
                x={(d) => xScale(d.date)}
                y={(d) => yScale(d[s.key])}
                stroke={s.color}
                strokeWidth={3}
                strokeOpacity={0.8}
              />
            ))}

            {/* Tooltip line */}
            {tooltipOpen && tooltipData && (
              <g>
                <line
                  x1={tooltipLeft - margin.left}
                  x2={tooltipLeft - margin.left}
                  y1={0}
                  y2={yMax}
                  stroke="#9ca3af"
                  strokeWidth={1}
                  strokeOpacity={0.5}
                  strokeDasharray="4,2"
                />
                {series.map((s) => (
                  <circle
                    key={s.key}
                    cx={xScale(tooltipData.date)}
                    cy={yScale(tooltipData[s.key])}
                    r={4}
                    fill={s.color}
                    stroke="white"
                    strokeWidth={2}
                    style={{ pointerEvents: "none" }}
                  />
                ))}
              </g>
            )}

            {/* Axes - positioned to align with container edges */}
            <AxisBottom
              top={yMax}
              scale={xScale}
              numTicks={6}
              stroke="#374151"
              tickStroke="#374151"
              tickLabelProps={{
                fill: "#9ca3af",
                fontSize: 11,
                textAnchor: "middle",
              }}
            />
          </Group>
        </svg>

        {/* Tooltip */}
        {tooltipOpen && tooltipData && (
          <TooltipWithBounds
            key={Math.random()}
            top={tooltipTop + margin.top}
            left={tooltipLeft}
            style={tooltipStyles}
          >
            <div>
              <div className="font-semibold mb-2">{tooltipData.month} 2024</div>
              {series.map((s) => (
                <div
                  key={s.key}
                  className="flex items-center justify-between gap-4 mb-1"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-sm">{s.name}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {s.key === "bodyFat"
                      ? `${tooltipData[s.key]}%`
                      : tooltipData[s.key]}
                  </span>
                </div>
              ))}
            </div>
          </TooltipWithBounds>
        )}
      </div>
      {/* Legend */}
      {/* <div className="mt-4 flex justify-center">
        <LegendOrdinal
          scale={legendScale}
          direction="row"
          labelMargin="0 15px 0 0"
        >
          {(labels) => (
            <div className="flex gap-4">
              {labels.map((label, i) => (
                <div key={`legend-${i}`} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: label.value }}
                  />
                  <span className="text-zinc-300 text-sm">{label.text}</span>
                </div>
              ))}
            </div>
          )}
        </LegendOrdinal>
      </div> */}
      {/* Quick stats */}
    </div>
  );
}
