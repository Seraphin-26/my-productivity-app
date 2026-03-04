// components/TasksClient.tsx
"use client";

import { useState, useTransition } from "react";
import {
  Sparkles, CheckCircle2, Circle, Tag, GripVertical,
  Loader2, ChevronDown, ChevronUp, Trash2, Plus,
  Clock, Flame, Zap, X, Pencil, Check,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type NoteStatus = "TODO" | "IN_PROGRESS" | "DONE";
type Priority   = "low" | "medium" | "high";

interface SuggestedTask { id: string; label: string; priority: Priority; }
interface AIInsight {
  summary: string;
  suggestedTasks: SuggestedTask[];
  suggestedTags: string[];
  modelUsed: string;
}
interface Note {
  id: string; title: string; content: string;
  status: NoteStatus; tags: string[];
  aiInsight: AIInsight | null;
  position: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_META: Record<Priority, { label: string; color: string; icon: React.ReactNode }> = {
  high:   { label: "Élevé",  color: "text-rose-400 bg-rose-950/60",   icon: <Flame  size={9} /> },
  medium: { label: "Moyen",  color: "text-amber-400 bg-amber-950/60", icon: <Zap    size={9} /> },
  low:    { label: "Faible", color: "text-slate-400 bg-slate-800",    icon: <Clock  size={9} /> },
};

function PriorityBadge({ p }: { p: Priority }) {
  const m = PRIORITY_META[p];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${m.color}`}>
      {m.icon}{m.label}
    </span>
  );
}

function TagChip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-700/40 text-indigo-300 text-[11px] font-medium">
      <Tag size={9} className="opacity-60" />{label}
      {onRemove && <button onClick={onRemove} className="opacity-50 hover:opacity-100 ml-0.5 text-xs leading-none">×</button>}
    </span>
  );
}

// ─── AIInsightPanel ───────────────────────────────────────────────────────────

function AIInsightPanel({ insight }: { insight: AIInsight }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mt-3 rounded-xl border border-violet-700/30 bg-gradient-to-br from-violet-950/50 to-indigo-950/30 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-semibold text-violet-300 hover:text-violet-200 transition-colors">
        <span className="flex items-center gap-1.5"><Sparkles size={11} />Analyse IA · {insight.modelUsed}</span>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-[12px] text-slate-300 leading-relaxed border-l-2 border-violet-600 pl-3">{insight.summary}</p>
          {insight.suggestedTasks.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-1.5">Tâches suggérées</p>
              <ul className="space-y-1.5">
                {insight.suggestedTasks.map(t => (
                  <li key={t.id} className="flex items-center gap-2 text-[12px] text-slate-300">
                    <span className="w-1 h-1 rounded-full bg-violet-500 flex-shrink-0" />
                    <span className="flex-1">{t.label}</span>
                    <PriorityBadge p={t.priority} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {insight.suggestedTags.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-1.5">Tags suggérés</p>
              <div className="flex flex-wrap gap-1.5">
                {insight.suggestedTags.map(tag => <TagChip key={tag} label={tag} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── NoteCard ─────────────────────────────────────────────────────────────────

function NoteCard({
  note, onStatusChange, onDelete, onAnalyze, onUpdate, isAnalyzing,
}: {
  note: Note;
  onStatusChange: (id: string, s: NoteStatus) => void;
  onDelete: (id: string) => void;
  onAnalyze: (id: string) => void;
  onUpdate: (id: string, data: Partial<Note>) => void;
  isAnalyzing: boolean;
}) {
  const [expanded, setExpanded]     = useState(false);
  const [editingTitle, setEditing]  = useState(false);
  const [titleDraft, setTitleDraft] = useState(note.title);
  const isDone = note.status === "DONE";

  const saveTitle = () => {
    if (titleDraft.trim() && titleDraft !== note.title)
      onUpdate(note.id, { title: titleDraft.trim() });
    setEditing(false);
  };

  return (
    <li className={`group relative rounded-2xl border transition-all duration-200
      ${isDone ? "border-slate-800/60 bg-slate-900/30 opacity-60" : "border-slate-700/60 bg-slate-900/80 hover:border-slate-600 hover:bg-slate-900"}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-30 transition-opacity cursor-grab">
        <GripVertical size={14} className="text-slate-400" />
      </div>
      <div className="px-5 py-4 pl-9">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button onClick={() => onStatusChange(note.id, isDone ? "TODO" : "DONE")}
            className="flex-shrink-0 mt-0.5 transition-transform active:scale-90">
            {isDone
              ? <CheckCircle2 size={19} className="text-emerald-400" />
              : <Circle       size={19} className="text-slate-600 hover:text-slate-400 transition-colors" />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {editingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus value={titleDraft}
                  onChange={e => setTitleDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") setEditing(false); }}
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-violet-500"
                />
                <button onClick={saveTitle} className="text-emerald-400 hover:text-emerald-300"><Check size={14} /></button>
                <button onClick={() => setEditing(false)} className="text-slate-500 hover:text-slate-300"><X size={14} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group/title">
                <h3 className={`text-sm font-semibold leading-snug ${isDone ? "line-through text-slate-500" : "text-slate-100"}`}>
                  {note.title}
                </h3>
                <button onClick={() => setEditing(true)}
                  className="opacity-0 group-hover/title:opacity-40 hover:!opacity-100 transition-opacity text-slate-400">
                  <Pencil size={11} />
                </button>
              </div>
            )}

            {note.content && (
              <button onClick={() => setExpanded(e => !e)}
                className="mt-1 text-[11px] text-slate-500 hover:text-slate-400 transition-colors flex items-center gap-1">
                {expanded ? "Réduire" : "Voir le contenu"}
                {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              </button>
            )}
            {expanded && note.content && (
              <p className="mt-2 text-[12px] text-slate-400 leading-relaxed">{note.content}</p>
            )}

            {note.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {note.tags.map(tag => <TagChip key={tag} label={tag} />)}
              </div>
            )}
            {note.aiInsight && <AIInsightPanel insight={note.aiInsight} />}
          </div>

          {/* Actions */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <button onClick={() => onAnalyze(note.id)} disabled={isAnalyzing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all active:scale-95 disabled:opacity-50
                ${note.aiInsight ? "bg-violet-900/40 border border-violet-700/40 text-violet-300 hover:bg-violet-800/50" : "bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-900/40"}`}>
              {isAnalyzing ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
              <span className="hidden sm:inline">{isAnalyzing ? "Analyse…" : note.aiInsight ? "Ré-analyser" : "Magie IA"}</span>
            </button>
            <button onClick={() => onDelete(note.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-950/30">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

// ─── CreateNoteForm ───────────────────────────────────────────────────────────

function CreateNoteForm({ onAdd }: { onAdd: (title: string, content: string) => void }) {
  const [title, setTitle]     = useState("");
  const [content, setContent] = useState("");
  const [open, setOpen]       = useState(false);

  const submit = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), content.trim());
    setTitle(""); setContent(""); setOpen(false);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-dashed border-slate-700 hover:border-violet-600/50 hover:bg-violet-950/10 text-slate-600 hover:text-violet-400 transition-all text-sm font-medium">
      <Plus size={16} />Nouvelle tâche
    </button>
  );

  return (
    <div className="rounded-2xl border border-violet-700/40 bg-slate-900/80 p-4 space-y-3">
      <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
        onKeyDown={e => e.key === "Enter" && submit()}
        placeholder="Titre de la tâche…"
        className="w-full bg-transparent text-sm font-semibold text-slate-100 placeholder-slate-600 outline-none" />
      <textarea value={content} onChange={e => setContent(e.target.value)} rows={2}
        placeholder="Description (optionnel)…"
        className="w-full bg-slate-800/60 rounded-xl px-3 py-2.5 text-sm text-slate-300 placeholder-slate-600 outline-none focus:ring-1 focus:ring-violet-600/50 resize-none" />
      <div className="flex gap-2 justify-end">
        <button onClick={() => setOpen(false)}
          className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">Annuler</button>
        <button onClick={submit} disabled={!title.trim()}
          className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-40">
          Ajouter
        </button>
      </div>
    </div>
  );
}

// ─── TasksClient (main export) ───────────────────────────────────────────────

export default function TasksClient({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes]             = useState<Note[]>(initialNotes);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [, startTransition]           = useTransition();

  // ── CRUD helpers ─────────────────────────────────────────

  const addNote = async (title: string, content: string) => {
    const res  = await fetch("/api/notes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    const { note } = await res.json();
    setNotes(p => [note, ...p]);
  };

  const updateNote = async (id: string, data: Partial<Note>) => {
    startTransition(() => setNotes(p => p.map(n => n.id === id ? { ...n, ...data } : n)));
    await fetch(`/api/notes/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  const deleteNote = async (id: string) => {
    setNotes(p => p.filter(n => n.id !== id));
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
  };

  const analyzeNote = async (id: string) => {
    if (analyzingId) return;
    setAnalyzingId(id);
    const note = notes.find(n => n.id === id)!;
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: id, title: note.title, content: note.content }),
      });
      if (!res.ok) throw new Error("API error");
      const insight = await res.json();
      setNotes(p => p.map(n => n.id === id ? { ...n, aiInsight: insight } : n));
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingId(null);
    }
  };

  // ── Derived state ─────────────────────────────────────────

  const todo  = notes.filter(n => n.status !== "DONE");
  const done  = notes.filter(n => n.status === "DONE");
  const pct   = notes.length ? Math.round((done.length / notes.length) * 100) : 0;

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Tâches</h1>
            <p className="text-sm text-slate-500 mt-0.5">{done.length}/{notes.length} complétées</p>
          </div>
          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">{pct}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Create */}
      <CreateNoteForm onAdd={addNote} />

      {/* TODO */}
      {todo.length > 0 && (
        <section className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold px-1">À faire · {todo.length}</p>
          <ul className="space-y-2">
            {todo.map(n => <NoteCard key={n.id} note={n} onStatusChange={(id, s) => updateNote(id, { status: s })} onDelete={deleteNote} onAnalyze={analyzeNote} onUpdate={updateNote} isAnalyzing={analyzingId === n.id} />)}
          </ul>
        </section>
      )}

      {/* DONE */}
      {done.length > 0 && (
        <section className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold px-1">Terminées · {done.length}</p>
          <ul className="space-y-2">
            {done.map(n => <NoteCard key={n.id} note={n} onStatusChange={(id, s) => updateNote(id, { status: s })} onDelete={deleteNote} onAnalyze={analyzeNote} onUpdate={updateNote} isAnalyzing={analyzingId === n.id} />)}
          </ul>
        </section>
      )}

      {notes.length === 0 && (
        <div className="text-center py-20 text-slate-600">
          <CheckCircle2 size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucune tâche pour le moment.</p>
          <p className="text-xs mt-1">Créez votre première tâche ci-dessus !</p>
        </div>
      )}
    </div>
  );
}
