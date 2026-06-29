'use client';

import { useMemo, useState } from 'react';
import { DataGrid, type Column, type RenderCellProps, type RenderEditCellProps } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { Plus, Trash2, X, Check } from 'lucide-react';
import TableCellEditor, { detectCellType } from './TableCellEditor';

export interface SpreadsheetGridProps {
  rows: Record<string, unknown>[];
  onRowsChange: (rows: Record<string, unknown>[]) => void;
  editingCol: string | null;
  setEditingCol: (col: string | null) => void;
  renamedCols: Record<string, string>;
  onDeleteRow: (id: string) => void;
  onDeleteColumn: (key: string) => void;
  onRenameColumn: (oldKey: string, newKey: string) => void;
  onAddRow: () => void;
  onAddColumn: (name: string) => boolean;
  maxHeight?: number;
}

export default function SpreadsheetGrid({
  rows,
  onRowsChange,
  editingCol,
  setEditingCol,
  renamedCols,
  onDeleteRow,
  onDeleteColumn,
  onRenameColumn,
  onAddRow,
  onAddColumn,
  maxHeight = 450,
}: SpreadsheetGridProps) {
  const [addingCol, setAddingCol] = useState(false);
  const [newColName, setNewColName] = useState('');

  // Detect cell types per column
  const colTypes = useMemo(() => {
    if (rows.length === 0) return {} as Record<string, 'text' | 'number' | 'boolean'>;
    const keys = [...new Set(rows.flatMap(r => Object.keys(r)))].filter(k => k !== '_rid');
    const types: Record<string, 'text' | 'number' | 'boolean'> = {};
    for (const key of keys) {
      const values = rows.slice(0, 10).map(r => r[key]);
      types[key] = detectCellType(values);
    }
    return types;
  }, [rows]);

  const dataColumns: Column<Record<string, unknown>>[] = useMemo(() => {
    if (rows.length === 0) return [];
    const keys = [...new Set(rows.flatMap(r => Object.keys(r)))].filter(k => k !== '_rid');

    const cols: Column<Record<string, unknown>>[] = keys.map(key => ({
      key,
      name: renamedCols[key] || key,
      resizable: true,
      sortable: false,
      minWidth: 80,
      renderEditCell: (p: RenderEditCellProps<Record<string, unknown>>) => (
        <TableCellEditor {...p} cellType={colTypes[key]} />
      ),
      renderHeaderCell: () => (
        <div className="flex items-center gap-1">
          {editingCol === key ? (
            <input
              autoFocus
              defaultValue={renamedCols[key] || key}
              className="w-full min-w-0 px-1 py-0.5 text-xs font-semibold border border-[#4F46E5] rounded outline-none text-[#1A1A2E]"
              onBlur={(e) => onRenameColumn(key, e.target.value.trim())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                if (e.key === 'Escape') setEditingCol(null);
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <span
                className="truncate flex-1 text-xs font-semibold text-[#4A4A6A] cursor-pointer hover:text-[#4F46E5]"
                onDoubleClick={(e) => { e.stopPropagation(); setEditingCol(key); }}
                title="Double-click to rename"
              >
                {renamedCols[key] || key}
              </span>
              <button
                aria-label={`Delete column ${renamedCols[key] || key}`}
                onClick={(e) => { e.stopPropagation(); onDeleteColumn(key); }}
                className="p-0.5 rounded hover:bg-red-100 hover:text-red-600 text-[#4A4A6A] flex-shrink-0"
                title="Delete column"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      ),
    }));

    cols.push({
      key: '_rdg_actions',
      name: '',
      width: 50,
      minWidth: 50,
      maxWidth: 50,
      frozen: true,
      renderCell: ({ row }: RenderCellProps<Record<string, unknown>>) => (
        <button
          aria-label={`Delete row ${row._rid}`}
          onClick={() => onDeleteRow(row._rid as string)}
          className="p-1 rounded hover:bg-red-100 hover:text-red-600 text-[#4A4A6A]"
          title="Delete row"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ),
    } as Column<Record<string, unknown>>);

    return cols;
  }, [rows, editingCol, renamedCols, colTypes, onDeleteRow, onDeleteColumn, onRenameColumn, setEditingCol]);

  const handleAddCol = () => {
    if (!newColName.trim()) return;
    if (onAddColumn(newColName.trim())) {
      setNewColName('');
      setAddingCol(false);
    }
  };

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-[#E8EDF2]">
        <DataGrid
          columns={dataColumns}
          rows={rows}
          rowKeyGetter={(row: Record<string, unknown>) => row._rid as string}
          onRowsChange={onRowsChange}
          defaultColumnOptions={{ resizable: true, sortable: false }}
          className="rdg-brand"
          style={{ height: Math.min(rows.length * 35 + 35, maxHeight) }}
          headerRowHeight={35}
          rowHeight={35}
        />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={onAddRow}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#C0C9D5] text-xs font-medium text-[#4A4A6A] hover:bg-[#F5F7FA] transition-colors"
          aria-label="Add row"
        >
          <Plus className="w-3.5 h-3.5" /> Add Row
        </button>

        {addingCol ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCol();
                if (e.key === 'Escape') { setAddingCol(false); setNewColName(''); }
              }}
              placeholder="Column name"
              className="w-32 px-2 py-1.5 text-xs border border-[#C0C9D5] rounded-xl outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
            />
            <button
              onClick={handleAddCol}
              className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              aria-label="Confirm add column"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setAddingCol(false); setNewColName(''); }}
              className="p-1.5 rounded-lg text-[#4A4A6A] hover:bg-[#F5F7FA] transition-colors"
              aria-label="Cancel add column"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingCol(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#C0C9D5] text-xs font-medium text-[#4A4A6A] hover:bg-[#F5F7FA] transition-colors"
            aria-label="Add column"
          >
            <Plus className="w-3.5 h-3.5" /> Add Column
          </button>
        )}

        <span className="text-[10px] text-[#4A4A6A]/50 ml-auto">Ctrl+Z to undo &middot; Ctrl+Y to redo</span>
      </div>
    </div>
  );
}
