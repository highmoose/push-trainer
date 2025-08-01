import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
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
import {
  Select,
  SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Switch,
} from "@heroui/react";

export default function ClientTopChart({ setSelectedClient }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 350 });
  const [selectedDateRange, setSelectedDateRange] = useState("12months");
  const [visibleSeries, setVisibleSeries] = useState({
    weight: true,
    bodyFat: true,
    muscle: true,
    endurance: true,
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(1);
  const [previousDomain, setPreviousDomain] = useState(null);

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: width || 800,
          height: 350,
        });
      }
    };

    updateDimensions();

    window.addEventListener("resize", updateDimensions);

    let resizeObserver;
    if (containerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        updateDimensions();
      });
      resizeObserver.observe(containerRef.current);
    }

    const timer = setTimeout(updateDimensions, 100);
    const intervalTimer = setInterval(updateDimensions, 500);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      clearTimeout(timer);
      clearInterval(intervalTimer);
    };
  }, []);

  const bisectDate = bisector((d) => d.date).left;

  // Date range options
  const dateRangeOptions = [
    { key: "3months", label: "Last 3 Months" },
    { key: "6months", label: "Last 6 Months" },
    { key: "12months", label: "Last 12 Months" },
    { key: "2years", label: "Last 2 Years" },
  ];

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

  const width = dimensions.width;
  const height = dimensions.height;
  const margin = { top: 20, right: 0, bottom: 40, left: 0 };
  const xMax = Math.max(width - margin.left - margin.right, 0);
  const yMax = height - margin.top - margin.bottom;

  const series = [
    { key: "weight", color: "#4BB760", name: "Weight (lbs)" },
    { key: "bodyFat", color: "#7BB646", name: "Body Fat (%)" },
    { key: "muscle", color: "#9EB533", name: "Muscle (lbs)" },
    { key: "endurance", color: "#C6B41C", name: "Endurance" },
  ];

  // Filter series based on visibility
  const activeSeries = series.filter((s) => visibleSeries[s.key]);

  // Scales
  const xScale = scaleTime({
    range: [0, xMax],
    domain: [data[0].date, data[data.length - 1].date],
  });

  // Calculate dynamic y-scale domain based on visible series with memoization
  const { minVisibleValue, maxVisibleValue } = useMemo(() => {
    const values = [];
    data.forEach((d) => {
      activeSeries.forEach((s) => {
        values.push(d[s.key]);
      });
    });

    return {
      minVisibleValue: values.length > 0 ? Math.min(...values) : 0,
      maxVisibleValue: values.length > 0 ? Math.max(...values) : 100,
    };
  }, [activeSeries, data]);

  const yScale = scaleLinear({
    range: [yMax, 0],
    domain: [
      Math.max(0, minVisibleValue * 0.95), // Reduced padding below minimum (was 0.9)
      maxVisibleValue * 1.05, // Reduced padding above maximum (was 1.1)
    ],
  });

  const legendScale = scaleOrdinal({
    domain: activeSeries.map((s) => s.name),
    range: activeSeries.map((s) => s.color),
  });

  // Helper function to toggle series visibility with animation
  const toggleSeries = (key) => {
    setIsAnimating(true);
    setVisibleSeries((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    // Reset animation state after transition
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const tooltipStyles = {
    ...defaultStyles,
    background: "rgba(0, 0, 0, 0.9)",
    border: "1px solid #374151",
    color: "white",
    borderRadius: "0px",
  };

  const handleTooltip = useCallback(
    (event) => {
      const { x } = localPoint(event) || { x: 0 };
      const x0 = xScale.invert(x);
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
      if (d) {
        showTooltip({
          tooltipData: d,
          tooltipLeft: x + margin.left,
          tooltipTop: yScale(d.weight),
        });
      }
    },
    [showTooltip, xScale, yScale, data, margin.left]
  );

  return (
    <div className="flex flex-col justify-between w-full bg-zinc-900  min-w-0">
      <div className="flex pt-10 px-10 justify-between">
        <div>
          <p className="text-xl font-thin mb-6 ">Client Statistics</p>

          <div className=" flex justify-between items-start">
            <div className="flex flex-wrap gap-12">
              <div>
                <p className="text-zinc-500 text-sm">Weight</p>
                <p className="text-white text-4xl">
                  110<span className="text-3xl pl-0.5">kg</span>
                </p>
              </div>
              <div>
                <p className="text-zinc-500 text-sm">Body Fat</p>
                <p className="text-white text-4xl">
                  15<span className="text-3xl pl-0.5">%</span>
                </p>
              </div>
              <div>
                <p className="text-zinc-500 text-sm">Energy & Mood</p>
                <p className="text-white text-4xl">
                  8<span className="text-3xl pl-0.5">/10</span>
                </p>
              </div>

              <div>
                <p className="text-zinc-500 text-sm">Engagement</p>
                <p className="text-white text-4xl">High</p>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Select */}
        <div className="flex gap-3">
          {/* Data Toggle Dropdown */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                size="sm"
                className="border-none bg-zinc-800/50 text-zinc-200 data-[hover=true]:border-zinc-500 rounded-none"
                aria-label="Toggle chart data series visibility"
              >
                Toggle Data
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Data series toggles"
              closeOnSelect={false}
              className="bg-zinc-800 border-zinc-600 rounded-none"
            >
              {series.map((seriesItem) => (
                <DropdownItem
                  key={seriesItem.key}
                  className="data-[hover=true]:bg-zinc-700 rounded-none"
                  textValue={seriesItem.name}
                >
                  <div className="flex items-center justify-between w-full ">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-none"
                        style={{ backgroundColor: seriesItem.color }}
                      />
                      <span className="text-zinc-200">{seriesItem.name}</span>
                    </div>
                    <Switch
                      size="sm"
                      isSelected={visibleSeries[seriesItem.key]}
                      onValueChange={() => toggleSeries(seriesItem.key)}
                      classNames={{
                        base: "flex-shrink-0",
                        wrapper: "bg-zinc-600  w-[34px] h-4",
                        thumb:
                          "bg-white  w-2.5 h-2.5 shadow-sm shadow-black/50",
                      }}
                    />
                  </div>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {/* Date Range Select */}
          <div className="min-w-[180px] ">
            <Select
              selectedKeys={new Set([selectedDateRange])}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0];
                setSelectedDateRange(selectedKey);
              }}
              size="sm"
              variant="bordered"
              aria-label="Select date range for chart"
              classNames={{
                base: "max-w-xs",
                trigger:
                  "border-none bg-zinc-800/50 data-[hover=true]:border-zinc-500 rounded-none",
                value: "text-zinc-200",
                popoverContent: "bg-zinc-800 border-zinc-600 rounded-none",
              }}
              placeholder="Select date range"
            >
              {dateRangeOptions.map((option) => (
                <SelectItem
                  key={option.key}
                  value={option.key}
                  classNames={{
                    base: "data-[hover=true]:bg-zinc-700 data-[selected=true]:bg-zinc-700 rounded-none",
                    title: "text-zinc-200",
                  }}
                >
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="w-full relative min-w-0 flex-shrink "
        style={{ padding: 0, margin: 0 }}
      >
        <svg
          width={width}
          height={height}
          className="w-full block"
          style={{ padding: 0, margin: 0, display: "block" }}
          role="img"
          aria-label="Client progress chart showing weight, body fat, muscle mass, and endurance over time"
        >
          {/* Define gradients for each line */}
          <defs>
            {activeSeries.map((s, index) => (
              <linearGradient
                key={s.key}
                id={`gradient-${s.key}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity="0.2" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          <rect width={width} height={height} fill="transparent" />
          <Group
            left={margin.left}
            top={margin.top}
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
            style={{
              transition: isAnimating
                ? "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                : "none",
            }}
          >
            {/* Invisible overlay for better tooltip interaction */}
            <rect
              width={xMax}
              height={yMax}
              fill="transparent"
              style={{ pointerEvents: "all" }}
            />
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
              strokeOpacity={0}
            />

            {/* Area fills with gradient */}
            {activeSeries.map((s) => (
              <AreaClosed
                key={`area-${s.key}`}
                data={data}
                x={(d) => xScale(d.date)}
                y={(d) => yScale(d[s.key])}
                yScale={yScale}
                strokeWidth={0}
                fill={`url(#gradient-${s.key})`}
                curve={curveMonotoneX}
                style={{
                  transition: isAnimating
                    ? "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                    : "none",
                }}
              />
            ))}

            {/* Lines */}
            {activeSeries.map((s) => (
              <LinePath
                key={s.key}
                curve={curveMonotoneX}
                data={data}
                x={(d) => xScale(d.date)}
                y={(d) => yScale(d[s.key])}
                stroke={s.color}
                strokeWidth={3}
                strokeOpacity={0.8}
                style={{
                  transition: isAnimating
                    ? "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                    : "none",
                }}
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
                {activeSeries.map((s) => (
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
              {activeSeries.map((s) => (
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
