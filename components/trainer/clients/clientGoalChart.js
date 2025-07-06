import React from "react";
import { Group } from "@visx/group";
import { Arc } from "@visx/shape";

export default function ClientGoalChart({ client, progress = 70 }) {
  // Chart dimensions
  const size = 280;
  const centerX = size / 2;
  const centerY = size / 2;
  const donutThickness = 8;
  const radius = size / 2 - donutThickness - 10;

  // Calculate angles - always start from top and go clockwise
  const startAngle = 0; // Top (12 o'clock)
  const endAngle = startAngle + (2 * Math.PI * progress) / 100;

  // Calculate end position for the progress indicator circle
  // Adjust for the visual offset - progress appears to start from top due to background arc
  const adjustedEndAngle = endAngle - Math.PI / 2; // Subtract 90 degrees to align with visual progress
  const middleRadius = radius;
  const endCircleX = Math.cos(adjustedEndAngle) * middleRadius;
  const endCircleY = Math.sin(adjustedEndAngle) * middleRadius;

  return (
    <div className="flex flex-col w-full items-center justify-center p-6 bg-zinc-900/50 rounded-lg backdrop-blur-sm ">
      <h3 className="text-white text-lg font-semibold mb-6">
        Progress to Goal
      </h3>

      <div className="relative">
        <svg width={size} height={size}>
          <defs>
            <linearGradient
              id="progressGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>

          <Group top={centerY} left={centerX}>
            {/* Background circle */}
            <Arc
              innerRadius={radius - donutThickness / 2}
              outerRadius={radius + donutThickness / 2}
              startAngle={-Math.PI / 2} // Start from top (12 o'clock)
              endAngle={-Math.PI / 2 + 2 * Math.PI} // Complete circle from top
              fill="#19191C"
            />

            {/* Progress arc - only render if progress > 0 */}
            {progress > 0 && (
              <Arc
                innerRadius={radius - donutThickness / 2}
                outerRadius={radius + donutThickness / 2}
                startAngle={startAngle}
                endAngle={endAngle}
                fill="url(#progressGradient)"
                cornerRadius={6}
              />
            )}

            {/* End circle indicator - follows the progress */}
            {progress > 0 && (
              <circle
                cx={endCircleX}
                cy={endCircleY}
                r={8}
                fill="#fff"
                stroke="#ffffff"
                strokeWidth={10}
                strokeOpacity={0.2}
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
              />
            )}
          </Group>
        </svg>

        {/* Center percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Circle background for the text */}
          <div className="absolute w-44 h-44 bg-zinc-800/20 rounded-full  backdrop-blur-sm"></div>
          <span className="text-[42px] text-white relative z-10">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}
