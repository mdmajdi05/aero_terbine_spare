'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export interface UndoItem {
  rows: Record<string, unknown>[];
  label: string;
}

export interface SpreadsheetEditorReturn {
  rows: Record<string, unknown>[];
  setRows: React.Dispatch<React.SetStateAction<Record<string, unknown>[]>>;
  editingCol: string | null;
  setEditingCol: React.Dispatch<React.SetStateAction<string | null>>;
  renamedCols: Record<string, string>;
  setRenamedCols: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  rowsRef: React.MutableRefObject<Record<string, unknown>[]>;
  addIds: (parsed: Record<string, unknown>[]) => Record<string, unknown>[];
  cleanRows: () => Record<string, unknown>[];
  pushUndo: (label: string) => void;
  undo: () => void;
  redo: () => void;
  handleRowsChange: (newRows: Record<string, unknown>[]) => void;
  handleDeleteRow: (id: string) => void;
  handleDeleteColumn: (key: string) => void;
  handleRenameColumn: (oldKey: string, newKey: string) => void;
  handleAddRow: () => void;
  handleAddColumn: (name: string) => boolean;
  resetState: () => void;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

export default function useSpreadsheetEditor(
  rowIdPrefix: string,
  onAutoSave?: (rows: Record<string, unknown>[]) => Promise<void>,
) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [editingCol, setEditingCol] = useState<string | null>(null);
  const [renamedCols, setRenamedCols] = useState<Record<string, string>>({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const rowsRef = useRef(rows);
  useEffect(() => { rowsRef.current = rows; }, [rows]);

  const idCounter = useRef(0);
  const undoStack = useRef<UndoItem[]>([]);
  const redoStack = useRef<UndoItem[]>([]);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEditLabel = useRef('');

  // ── Add unique IDs ──
  const addIds = useCallback((parsed: Record<string, unknown>[]) =>
    parsed.map((row) => ({ ...row, _rid: `${rowIdPrefix}_${++idCounter.current}` })),
  [rowIdPrefix]);

  // ── Strip IDs ──
  const cleanRows = useCallback(() =>
    rows.map(({ _rid: _, ...rest }) => rest),
  [rows]);

  // ── Undo / Redo ──
  const pushUndo = useCallback((label: string) => {
    undoStack.current.push({ rows: JSON.parse(JSON.stringify(rowsRef.current)), label });
    redoStack.current = [];
  }, []);

  const undo = useCallback(() => {
    const item = undoStack.current.pop();
    if (!item) return;
    redoStack.current.push({ rows: JSON.parse(JSON.stringify(rowsRef.current)), label: item.label });
    setRows(item.rows);
    toast(`Undo: ${item.label}`, { duration: 3000, position: 'bottom-center' });
  }, []);

  const redo = useCallback(() => {
    const item = redoStack.current.pop();
    if (!item) return;
    undoStack.current.push({ rows: JSON.parse(JSON.stringify(rowsRef.current)), label: item.label });
    setRows(item.rows);
    toast(`Redo: ${item.label}`, { duration: 3000, position: 'bottom-center' });
  }, []);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  // ── Auto-save debounce ──
  const lastSavedRef = useRef('');
  useEffect(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (!onAutoSave || rows.length === 0) return;
    const serialized = JSON.stringify(rows);
    if (serialized === lastSavedRef.current) return;
    idleTimer.current = setTimeout(async () => {
      setAutoSaveStatus('saving');
      try {
        await onAutoSave(rows.map(({ _rid: _, ...rest }) => rest));
        lastSavedRef.current = serialized;
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } catch {
        setAutoSaveStatus('error');
      }
    }, 1500);
    return () => { if (idleTimer.current) clearTimeout(idleTimer.current); };
  }, [rows, onAutoSave]);

  // ── Cell edit undo tracking ──
  const trackCellEdit = useCallback(() => {
    const now = Date.now().toString();
    if (now === lastEditLabel.current) return;
    lastEditLabel.current = now;
    pushUndo('Cell edit');
  }, [pushUndo]);

  // ── Handlers ──
  const handleRowsChange = useCallback((newRows: Record<string, unknown>[]) => {
    setRows(newRows);
    trackCellEdit();
  }, [trackCellEdit]);

  const handleDeleteRow = useCallback((id: string) => {
    const current = rowsRef.current;
    if (!current.some(r => r._rid === id)) return;
    pushUndo('Delete row');
    setRows(prev => prev.filter(r => r._rid !== id));
    toast('Row deleted — Ctrl+Z to undo', { duration: 3000, position: 'bottom-center' });
  }, [pushUndo]);

  const handleDeleteColumn = useCallback((key: string) => {
    pushUndo(`Delete column "${key}"`);
    setRows(prev => prev.map(r => {
      const { [key]: _, ...rest } = r;
      return rest;
    }));
    toast('Column deleted — Ctrl+Z to undo', { duration: 3000, position: 'bottom-center' });
  }, [pushUndo]);

  const handleRenameColumn = useCallback((oldKey: string, newKey: string) => {
    if (!newKey.trim() || oldKey === newKey) { setEditingCol(null); return; }
    pushUndo(`Rename "${oldKey}" to "${newKey}"`);
    setRows(prev => prev.map(r => {
      const { [oldKey]: val, ...rest } = r;
      return { ...rest, [newKey]: val };
    }));
    setRenamedCols(prev => {
      const next = { ...prev };
      next[oldKey] = newKey;
      return next;
    });
    setEditingCol(null);
  }, [pushUndo]);

  const handleAddRow = useCallback(() => {
    pushUndo('Add row');
    const current = rowsRef.current;
    const allKeys = current.length > 0
      ? [...new Set(current.flatMap(r => Object.keys(r)))].filter(k => k !== '_rid')
      : [];
    const newRow: Record<string, unknown> = { _rid: `${rowIdPrefix}_${++idCounter.current}` };
    allKeys.forEach(k => { newRow[k] = ''; });
    setRows(prev => [...prev, newRow]);
  }, [pushUndo, rowIdPrefix]);

  const handleAddColumn = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const current = rowsRef.current;
    const allKeys = [...new Set(current.flatMap(r => Object.keys(r)))];
    if (allKeys.includes(trimmed)) {
      toast.error(`Column "${trimmed}" already exists`);
      return false;
    }
    pushUndo(`Add column "${trimmed}"`);
    setRows(prev => prev.map(r => ({ ...r, [trimmed]: '' })));
    return true;
  }, [pushUndo]);

  const resetState = useCallback(() => {
    setRows([]);
    setEditingCol(null);
    setRenamedCols({});
    undoStack.current = [];
    redoStack.current = [];
    idCounter.current = 0;
    lastSavedRef.current = '';
    setAutoSaveStatus('idle');
  }, []);

  return {
    rows, setRows,
    editingCol, setEditingCol,
    renamedCols, setRenamedCols,
    rowsRef,
    addIds, cleanRows,
    pushUndo, undo, redo,
    handleRowsChange,
    handleDeleteRow,
    handleDeleteColumn,
    handleRenameColumn,
    handleAddRow,
    handleAddColumn,
    resetState,
    autoSaveStatus,
  };
}
