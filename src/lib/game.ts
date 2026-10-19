export type Tone = 'wood' | 'bell' | 'electronic';
export type Theme = 'light' | 'dark';
export type SkinId = 'wood' | 'rosewood' | 'jade';

export interface Settings {
  volume: number;
  muted: boolean;
  tone: Tone;
  vibration: boolean;
  reducedMotion: boolean;
  theme: Theme;
  autoBpm: number;
  skin: SkinId;
}

export interface Progress {
  total: number;
  today: number;
  todayKey: string;
  bestCombo: number;
  autoTaps: number;
  history: Record<string, number>;
  achievements: string[];
}

export interface Store {
  settings: Settings;
  progress: Progress;
}

export const STORAGE_KEY = 'wooden-fish.v1';
export const COMBO_WINDOW = 1500;
export const MAX_HISTORY_DAYS = 90;

export const DEFAULT_SETTINGS: Settings = {
  volume: 0.75,
  muted: false,
  tone: 'wood',
  vibration: true,
  reducedMotion: false,
  theme: 'light',
  autoBpm: 60,
  skin: 'wood',
};

export function dayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function emptyProgress(): Progress {
  return {
    total: 0,
    today: 0,
    todayKey: dayKey(),
    bestCombo: 0,
    autoTaps: 0,
    history: {},
    achievements: [],
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function prefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches === true;
}

export function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        settings: { ...DEFAULT_SETTINGS, theme: prefersDark() ? 'dark' : 'light' },
        progress: emptyProgress(),
      };
    }
    const parsed: unknown = JSON.parse(raw);
    const source = isRecord(parsed) ? parsed : {};
    const rawSettings = isRecord(source.settings) ? source.settings : {};
    const rawProgress = isRecord(source.progress) ? source.progress : {};

    const settings: Settings = {
      volume:
        typeof rawSettings.volume === 'number' ? clamp(rawSettings.volume, 0, 1) : DEFAULT_SETTINGS.volume,
      muted: typeof rawSettings.muted === 'boolean' ? rawSettings.muted : DEFAULT_SETTINGS.muted,
      tone:
        rawSettings.tone === 'wood' || rawSettings.tone === 'bell' || rawSettings.tone === 'electronic'
          ? rawSettings.tone
          : DEFAULT_SETTINGS.tone,
      vibration: typeof rawSettings.vibration === 'boolean' ? rawSettings.vibration : DEFAULT_SETTINGS.vibration,
      reducedMotion:
        typeof rawSettings.reducedMotion === 'boolean' ? rawSettings.reducedMotion : DEFAULT_SETTINGS.reducedMotion,
      theme:
        rawSettings.theme === 'dark' || rawSettings.theme === 'light'
          ? rawSettings.theme
          : prefersDark()
            ? 'dark'
            : 'light',
      autoBpm: typeof rawSettings.autoBpm === 'number' ? clamp(Math.round(rawSettings.autoBpm), 30, 240) : 60,
      skin:
        rawSettings.skin === 'rosewood' || rawSettings.skin === 'jade' || rawSettings.skin === 'wood'
          ? rawSettings.skin
          : 'wood',
    };

    const rawHistory = isRecord(rawProgress.history) ? rawProgress.history : {};
    const history: Record<string, number> = {};
    for (const [key, value] of Object.entries(rawHistory)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(key) && typeof value === 'number' && value >= 0) {
        history[key] = Math.floor(value);
      }
    }

    const storedKey = typeof rawProgress.todayKey === 'string' ? rawProgress.todayKey : dayKey();
    const total = typeof rawProgress.total === 'number' ? Math.max(0, Math.floor(rawProgress.total)) : 0;
    const progress: Progress = {
      total,
      today: storedKey === dayKey() && typeof rawProgress.today === 'number' ? Math.max(0, Math.floor(rawProgress.today)) : 0,
      todayKey: dayKey(),
      bestCombo:
        typeof rawProgress.bestCombo === 'number' ? Math.max(0, Math.floor(rawProgress.bestCombo)) : 0,
      autoTaps: typeof rawProgress.autoTaps === 'number' ? Math.max(0, Math.floor(rawProgress.autoTaps)) : 0,
      history,
      achievements: Array.isArray(rawProgress.achievements)
        ? rawProgress.achievements.filter((id): id is string => typeof id === 'string')
        : [],
    };

    return { settings, progress };
  } catch {
    return { settings: { ...DEFAULT_SETTINGS }, progress: emptyProgress() };
  }
}

export function saveStore(store: Store): void {
  try {
    const entries = Object.entries(store.progress.history).sort(([a], [b]) => (a < b ? 1 : -1));
    const history = Object.fromEntries(entries.slice(0, MAX_HISTORY_DAYS));
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        settings: store.settings,
        progress: { ...store.progress, history },
      }),
    );
  } catch {
    // Storage can be unavailable (private mode / quota). The app still works in-memory.
  }
}

/* ------------------------------------------------------------------ */
/* Levels                                                              */
/* ------------------------------------------------------------------ */

export interface Level {
  min: number;
  name: string;
  roman: string;
}

export const LEVELS: Level[] = [
  { min: 0, name: '初心', roman: 'BEGINNER' },
  { min: 60, name: '沙弥', roman: 'NOVICE' },
  { min: 300, name: '行者', roman: 'WANDERER' },
  { min: 1200, name: '比丘', roman: 'MONK' },
  { min: 5000, name: '罗汉', roman: 'ARHAT' },
  { min: 20000, name: '菩萨', roman: 'BODHISATTVA' },
  { min: 100000, name: '佛陀', roman: 'BUDDHA' },
];

export function levelFor(total: number): { level: Level; next: Level | null; index: number; ratio: number; remaining: number } {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i += 1) {
    if (total >= LEVELS[i].min) index = i;
  }
  const level = LEVELS[index];
  const next = index + 1 < LEVELS.length ? LEVELS[index + 1] : null;
  const ratio = next ? clamp((total - level.min) / (next.min - level.min), 0, 1) : 1;
  return { level, next, index, ratio, remaining: next ? Math.max(0, next.min - total) : 0 };
}

/* ------------------------------------------------------------------ */
/* Skins                                                               */
/* ------------------------------------------------------------------ */

export interface Skin {
  id: SkinId;
  name: string;
  hint: string;
  unlockAt: number;
}

export const SKINS: Skin[] = [
  { id: 'wood', name: '原木', hint: '温润质朴', unlockAt: 0 },
  { id: 'rosewood', name: '紫檀', hint: '沉静幽香', unlockAt: 500 },
  { id: 'jade', name: '白玉', hint: '无瑕清净', unlockAt: 2000 },
];

/* ------------------------------------------------------------------ */
/* Achievements                                                        */
/* ------------------------------------------------------------------ */

export interface AchievementSnapshot {
  total: number;
  today: number;
  bestCombo: number;
  autoTaps: number;
}

export interface Achievement {
  id: string;
  char: string;
  name: string;
  desc: string;
  check: (snapshot: AchievementSnapshot) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', char: '初', name: '初叩佛音', desc: '敲响第一声木鱼', check: (s) => s.total >= 1 },
  { id: 'hundred', char: '百', name: '百声入定', desc: '累计功德达到 100', check: (s) => s.total >= 100 },
  { id: 'thousand', char: '千', name: '千锤百炼', desc: '累计功德达到 1,000', check: (s) => s.total >= 1000 },
  { id: 'tenThousand', char: '万', name: '万法归一', desc: '累计功德达到 10,000', check: (s) => s.total >= 10000 },
  { id: 'combo30', char: '连', name: '行云流水', desc: '达成 30 连击', check: (s) => s.bestCombo >= 30 },
  { id: 'combo100', char: '定', name: '一心不乱', desc: '达成 100 连击', check: (s) => s.bestCombo >= 100 },
  { id: 'auto50', char: '息', name: '心息相依', desc: '自动敲击 50 次', check: (s) => s.autoTaps >= 50 },
  { id: 'daily500', char: '日', name: '精进一日', desc: '单日功德达到 500', check: (s) => s.today >= 500 },
  { id: 'rosewood', char: '檀', name: '紫檀沉香', desc: '解锁紫檀木鱼', check: (s) => s.total >= 500 },
  { id: 'jade', char: '玉', name: '白玉无瑕', desc: '解锁白玉木鱼', check: (s) => s.total >= 2000 },
];

export function newlyUnlocked(progress: Progress, achieved: string[]): Achievement[] {
  const snapshot: AchievementSnapshot = {
    total: progress.total,
    today: progress.today,
    bestCombo: progress.bestCombo,
    autoTaps: progress.autoTaps,
  };
  return ACHIEVEMENTS.filter((item) => !achieved.includes(item.id) && item.check(snapshot));
}

/* ------------------------------------------------------------------ */
/* Stats helpers                                                       */
/* ------------------------------------------------------------------ */

export interface DayStat {
  key: string;
  label: string;
  full: string;
  value: number;
  isToday: boolean;
}

export function lastSevenDays(history: Record<string, number>, todayCount: number): DayStat[] {
  const days: DayStat[] = [];
  const now = new Date();
  const week = ['日', '一', '二', '三', '四', '五', '六'];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const key = dayKey(date);
    const value = offset === 0 ? todayCount : history[key] ?? 0;
    days.push({
      key,
      label: week[date.getDay()],
      full: `${date.getMonth() + 1}/${date.getDate()}`,
      value,
      isToday: offset === 0,
    });
  }
  return days;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('zh-CN');
}

export function skinUnlocked(skin: Skin, total: number): boolean {
  return total >= skin.unlockAt;
}
