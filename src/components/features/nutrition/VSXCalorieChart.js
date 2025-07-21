import React from "react";
import { Group } from "@visx/group";
import { LinePath, AreaClosed } from "@visx/shape";
import { scaleLinear } from "@visx/scale";
import { LinearGradient } from "@visx/gradient";
import { curveMonotoneX } from "@visx/curve";

/**
 * VSX Chart Component for Calorie Distribution
 * Renders a smooth line chart with gradient area for calorie data
 */
const VSXCalorieChart = ({
  data,
  width = 140,
  height = 50,
  color = "#4BB760",
  chartId = "default",
}) => {
  if (!data || data.length === 0) return null;

  const maxCalories = Math.max(...data.map((d) => d.calories));
  const minCalories = Math.min(...data.map((d) => d.calories));

  const xScale = scaleLinear({
    domain: [0, data.length - 1],
    range: [10, width - 10],
  });

  const yScale = scaleLinear({
    domain: [minCalories * 0.9, maxCalories * 1.1],
    range: [height - 10, 10],
  });

  const points = data.map((d, i) => ({
    x: xScale(i),
    y: yScale(d.calories),
  }));

  const gradientId = `area-gradient-${chartId}`;

  return (
    <div className="flex items-center justify-center">
      <svg width={width} height={height}>
        <defs>
          <LinearGradient
            id={gradientId}
            from={color}
            to={color}
            fromOpacity={0.3}
            toOpacity={0}
          />
        </defs>
        <Group>
          {/* Area with gradient */}
          <AreaClosed
            data={points}
            x={(d) => d.x}
            y={(d) => d.y}
            yScale={yScale}
            fill={`url(#${gradientId})`}
            curve={curveMonotoneX}
          />
          {/* Smooth line */}
          <LinePath
            data={points}
            x={(d) => d.x}
            y={(d) => d.y}
            stroke={color}
            strokeWidth={2}
            fill="none"
            curve={curveMonotoneX}
          />
        </Group>
      </svg>
    </div>
  );
};

export default VSXCalorieChart;
