"use client";

import React, { useState } from "react";
import { Eye, Trash2, MoreHorizontal, Grid, List } from "lucide-react";

export default function DataTable({
  data = [],
  columns = [],
  onRowClick,
  onRowAction,
  loading = false,
  emptyMessage = "No data found",
  emptyDescription = "There are no items to display",
  viewMode = "list", // "list" or "grid"
  onViewModeChange,
  showViewToggle = true,
  className = "",
}) {
  const [hoveredRow, setHoveredRow] = useState(null);

  if (loading) {
    return (
      <div className="w-full h-full">
        {/* Header with loading skeleton */}
        <div className="border border-zinc-800/50 overflow-hidden h-full flex flex-col">
          <div className="px-6 py-4 border-b border-zinc-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {columns.slice(0, 3).map((_, index) => (
                  <div
                    key={index}
                    className="h-4 bg-zinc-700/50 rounded animate-pulse w-20"
                  ></div>
                ))}
              </div>
              {showViewToggle && (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-16 bg-zinc-700/50 rounded animate-pulse"></div>
                </div>
              )}
            </div>
          </div>
          {/* Loading rows */}
          <div className="flex-1 overflow-y-auto">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="px-6 py-4  last:border-b-0">
                <div className="flex items-center gap-4">
                  <div className="h-6 bg-zinc-700/50 rounded animate-pulse w-8"></div>
                  <div className="h-10 w-10 bg-zinc-700/50 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-700/50 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-zinc-700/50 rounded animate-pulse w-1/2"></div>
                  </div>
                  {columns.slice(2).map((_, colIndex) => (
                    <div
                      key={colIndex}
                      className="h-4 bg-zinc-700/50 rounded animate-pulse w-16"
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-full">
        <div className="border border-zinc-800/50 overflow-hidden h-full flex flex-col">
          {/* Header */}
          <div className="px-8 py-4 border-b border-zinc-800/50">
            <div className="flex items-center w-full">
              <div className="flex items-center text-sm font-medium text-zinc-400 w-full">
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className={`flex items-center gap-2 min-w-0 ${
                      column.className || "flex-1"
                    }`}
                  >
                    {column.icon && (
                      <column.icon className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="truncate">{column.label}</span>
                    {column.headerExtras && column.headerExtras}
                  </div>
                ))}
              </div>
              {/* Actions column header space */}
              <div className="w-32 flex-shrink-0 text-right">
                {showViewToggle && (
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => onViewModeChange?.("list")}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        viewMode === "list"
                          ? "bg-zinc-700/50 text-white"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                      }`}
                      title="List View"
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onViewModeChange?.("grid")}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        viewMode === "grid"
                          ? "bg-zinc-700/50 text-white"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                      }`}
                      title="Grid View"
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Empty state */}
          <div className="px-6 py-16 text-center">
            <div className="bg-zinc-800/30 rounded-full p-8 w-24 h-24 mx-auto mb-6 border border-zinc-700/50">
              <div className="h-8 w-8 mx-auto text-zinc-500">
                {columns[0]?.icon ? (
                  React.createElement(columns[0].icon, { className: "h-8 w-8" })
                ) : (
                  <List className="h-8 w-8" />
                )}
              </div>
            </div>
            <p className="text-xl mb-2 font-semibold text-zinc-300">
              {emptyMessage}
            </p>
            <p className="text-sm text-zinc-500">{emptyDescription}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${className}`}>
      {viewMode === "grid" ? (
        // Grid View
        <div className="space-y-6">
          {/* Header with view toggle */}
          <div className="flex items-center justify-between px-6">
            <h3 className="text-lg font-medium text-white">
              {data.length} {data.length === 1 ? "item" : "items"}
            </h3>
            {showViewToggle && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewModeChange?.("list")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-zinc-700/50 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onViewModeChange?.("grid")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-zinc-700/50 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                  title="Grid View"
                >
                  <Grid className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Grid Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-6">
            {data.map((row, rowIndex) => (
              <div
                key={row.id || rowIndex}
                className={`group relative bg-gradient-to-br from-zinc-800/40 to-zinc-900/40 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 border cursor-pointer ${
                  row.isGenerating
                    ? "border-zinc-500/30 bg-zinc-500/5 shadow-lg shadow-zinc-500/10"
                    : "border-zinc-700/30 hover:border-zinc-600/50 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1"
                }`}
                onClick={() => onRowClick?.(row, rowIndex)}
              >
                {/* Card content using first column render */}
                <div className="space-y-3">
                  {columns[0]?.render ? (
                    columns[0].render(row[columns[0].key], row, rowIndex)
                  ) : (
                    <div className="font-medium text-white">
                      {row[columns[0].key]}
                    </div>
                  )}

                  {/* Additional info from other columns */}
                  <div className="space-y-2 text-sm">
                    {columns.slice(1, 3).map((column) => (
                      <div
                        key={column.key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-zinc-400">{column.label}:</span>
                        <div>
                          {column.render ? (
                            column.render(row[column.key], row, rowIndex)
                          ) : (
                            <span className="text-white">
                              {row[column.key]}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions overlay */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowAction?.("view", row, rowIndex);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-all duration-200"
                      title="View Details"
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowAction?.("delete", row, rowIndex);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // List View (Table)
        <div className="h-full flex flex-col border-0 overflow-hidden">
          {/* Header */}
          <div className="px-8 py-4 border-b-0 flex-shrink-0">
            <div className="flex items-center w-full">
              <div className="flex items-center text-sm font-medium text-zinc-400 w-full">
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className={`flex items-center gap-2 min-w-0 ${
                      column.className || "flex-1"
                    }`}
                  >
                    {column.icon && (
                      <column.icon className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="truncate">{column.label}</span>
                    {column.headerExtras && column.headerExtras}
                  </div>
                ))}
              </div>
              {/* Actions column header space */}
              <div className="w-32 flex-shrink-0 text-right">
                <span className="text-xs text-zinc-500">Actions</span>
              </div>
            </div>
          </div>

          {/* Table Body - Add scrollable container */}
          <div
            className="flex-1 overflow-y-auto space-y-0 min-h-0"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#52525b #27272a",
            }}
          >
            {data.map((row, rowIndex) => (
              <div
                key={row.id || rowIndex}
                className={`group relative px-8 py-4 transition-all duration-200 cursor-pointer border-t border-b border-zinc-800/30 ${
                  hoveredRow === rowIndex
                    ? "bg-zinc-800/30"
                    : "hover:bg-zinc-800/20"
                }`}
                onMouseEnter={() => setHoveredRow(rowIndex)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => onRowClick?.(row, rowIndex)}
              >
                <div className="flex items-center w-full">
                  {columns.map((column) => (
                    <div
                      key={column.key}
                      className={`min-w-0 ${column.className || "flex-1"}`}
                    >
                      {column.render ? (
                        column.render(row[column.key], row, rowIndex)
                      ) : (
                        <span className="text-white truncate">
                          {row[column.key]}
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Actions - Make visible by default */}
                  <div className="flex items-center gap-2 w-32 justify-end transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowAction?.("view", row, rowIndex);
                      }}
                      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-all duration-200"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowAction?.("delete", row, rowIndex);
                      }}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowAction?.("menu", row, rowIndex);
                      }}
                      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-all duration-200"
                      title="More Actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
