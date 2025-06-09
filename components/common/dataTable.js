"use client";

import React from "react";

export default function ReusableTable({
  columns = [],
  data = [],
  renderActions,
  minRows = 5,
}) {
  return (
    <div
      className="relative overflow-x-auto shadow-md sm:rounded"
      style={{
        height: `${minRows * 56}px`, // fixed height
        overflowY: "auto",
      }}
    >
      <table className="w-full text-sm text-left rtl:text-right text-zinc-white">
        <thead className="text-xs text-zinc-white uppercase bg-zinc-900 sticky top-0">
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col" className="px-6 py-3 bg-zinc-900">
                {col.label}
              </th>
            ))}
            {renderActions && (
              <th scope="col" className="px-6 py-3 bg-zinc-900 text-right">
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="bg-zinc-200 border-b border-zinc-300/50 hover:bg-zinc-300"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-6 py-2 whitespace-nowrap font-medium text-zinc-900"
                >
                  {row[col.key]}
                </td>
              ))}
              {renderActions && (
                <td className="px-6  text-right">
                  <div className="inline-flex my-2.5 justify-end gap-4">
                    {renderActions(row, idx)}
                  </div>
                </td>
              )}
            </tr>
          ))}

          {Array.from({ length: Math.max(minRows - data.length, 0) }).map(
            (_, idx) => (
              <tr key={`empty-${idx}`} className="bg-zinc-200 ">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-3">
                    &nbsp;
                  </td>
                ))}
                {renderActions && (
                  <td className="px-6 py-3 text-right">&nbsp;</td>
                )}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
