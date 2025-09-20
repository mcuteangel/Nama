export interface Tag {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ContactTag {
  id: string;
  contact_id: string;
  tag_id: string;
  created_at: string;
}

export interface TagWithCount extends Tag {
  contact_count?: number;
}

export type TagColor =
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'pink'
  | 'indigo'
  | 'orange'
  | 'teal'
  | 'cyan'
  | 'gray'
  | 'emerald'
  | 'lime'
  | 'amber'
  | 'rose'
  | 'violet'
  | 'slate'
  | 'zinc'
  | 'neutral'
  | 'stone';

export const TAG_COLORS: Record<TagColor, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#10b981',
  yellow: '#eab308',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
  orange: '#f97316',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  gray: '#6b7280',
  emerald: '#10b981',
  lime: '#84cc16',
  amber: '#f59e0b',
  rose: '#f43f5e',
  violet: '#8b5cf6',
  slate: '#64748b',
  zinc: '#71717a',
  neutral: '#737373',
  stone: '#78716c'
};

export const TAG_COLOR_VARIANTS: Record<TagColor, string> = {
  red: 'bg-red-100 text-red-800 border-red-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  pink: 'bg-pink-100 text-pink-800 border-pink-200',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  teal: 'bg-teal-100 text-teal-800 border-teal-200',
  cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  lime: 'bg-lime-100 text-lime-800 border-lime-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  rose: 'bg-rose-100 text-rose-800 border-rose-200',
  violet: 'bg-violet-100 text-violet-800 border-violet-200',
  slate: 'bg-slate-100 text-slate-800 border-slate-200',
  zinc: 'bg-zinc-100 text-zinc-800 border-zinc-200',
  neutral: 'bg-neutral-100 text-neutral-800 border-neutral-200',
  stone: 'bg-stone-100 text-stone-800 border-stone-200'
};