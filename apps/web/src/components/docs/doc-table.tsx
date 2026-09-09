import type { ReactNode } from 'react';

type DocTableProps = {
  headers: string[];
  rows: ReactNode[][];
};

export function DocTable({ headers, rows }: DocTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
        <thead className="bg-white/[0.045]">
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col" className="border-b border-white/10 px-4 py-3 font-medium text-white/75">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-white/[0.07] last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3.5 align-top leading-6 text-white/56">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
