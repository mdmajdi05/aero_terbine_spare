'use client';

import { useState } from 'react';
import type { RenderEditCellProps } from 'react-data-grid';

export type CellType = 'text' | 'number' | 'boolean';

export default function TableCellEditor(
  props: RenderEditCellProps<Record<string, unknown>> & { cellType?: CellType },
) {
  const colKey = props.column.key;
  const raw = props.row[colKey];
  const [val, setVal] = useState(() => String(raw ?? ''));

  const commit = () => {
    let final: unknown = val;
    if (props.cellType === 'number') {
      final = val === '' ? '' : Number(val);
    }
    props.onRowChange({ ...props.row, [colKey]: final }, true);
  };

  return (
    <input
      autoFocus
      type={props.cellType === 'number' ? 'number' : 'text'}
      className="w-full h-full px-2 border-0 outline-none text-sm bg-white"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => {
        commit();
        props.onRowChange({ ...props.row, [colKey]: val }, true);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          commit();
          (e.target as HTMLInputElement).blur();
        }
        if (e.key === 'Escape') props.onClose(false);
      }}
    />
  );
}

export function detectCellType(values: (unknown | undefined)[]): CellType {
  if (values.length === 0) return 'text';
  const nonEmpty = values.filter(v => v !== '' && v != null);
  if (nonEmpty.length === 0) return 'text';
  if (nonEmpty.every(v => !isNaN(Number(v)) && v !== true && v !== false)) return 'number';
  return 'text';
}
