"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";

export default function ReusableTable({
  columns = [],
  data = [],
  renderActions,
  minRows = 5,
  isStriped = true,
  selectionMode = "none",
  className = "",
}) {
  // Fill empty rows to meet minimum requirement
  const displayData = [...data];
  const emptyRowsNeeded = Math.max(minRows - data.length, 0);
  for (let i = 0; i < emptyRowsNeeded; i++) {
    const emptyRow = {};
    columns.forEach((col) => {
      emptyRow[col.key] = "\u00A0"; // non-breaking space
    });
    displayData.push(emptyRow);
  }

  return (
    <Table
      isStriped={isStriped}
      selectionMode={selectionMode}
      classNames={{
        base: `min-h-[${minRows * 56}px] ${className}`,
        table: "bg-zinc-900",
        thead: "[&>tr]:first:shadow-none",
        th: "bg-zinc-900 text-zinc-100 text-xs uppercase font-semibold",
        tbody: "",
        tr: "hover:bg-zinc-800/50 data-[odd=true]:bg-zinc-900/30",
        td: "text-white px-6 py-2",
      }}
      className="bg-zinc-900"
    >
      <TableHeader>
        {columns.map((col) => (
          <TableColumn key={col.key}>{col.label}</TableColumn>
        ))}
        {renderActions && (
          <TableColumn key="actions" className="text-right">
            Actions
          </TableColumn>
        )}
      </TableHeader>

      <TableBody>
        {displayData.map((row, idx) => (
          <TableRow key={idx}>
            {columns.map((col) => (
              <TableCell key={col.key}>{row[col.key]}</TableCell>
            ))}
            {renderActions && idx < data.length && (
              <TableCell className="text-right">
                <div className="inline-flex justify-end gap-4">
                  {renderActions(row, idx)}
                </div>
              </TableCell>
            )}
            {renderActions && idx >= data.length && (
              <TableCell className="text-right">{"\u00A0"}</TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
