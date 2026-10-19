import { useCallback, useEffect, useRef, useState } from 'react';
import { WoodenFish } from './components/WoodenFish';
import { Mallet } from './components/Mallet';
import { Toasts, type ToastItem } from './components/Toasts';
import { StatsSheet } from './components/StatsSheet';
import { SettingsSheet } from './components/SettingsSheet';
import {
  ACHIEVEMENTS,
  COMBO_WINDOW,
  dayKey,
  emptyProgress,
  formatNumber,
  levelFor,
  loadStore,
  newlyUnlocked,
  saveStore,
  SKINS,
  skinUnlocked,
  type Progress,
  type Settings,
  type SkinId,
  type Store,
  type Tone,
} from './lib/game';
import { SoundEngine } from './lib/audio';
import { downloadMeritCard } from './lib/share';
import {
  ChartIcon,
  KeyboardIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  SlidersIcon,
  SunIcon,
  VolumeIcon,
  VolumeOffIcon,
} from './components/Icons';

type TapSource = 'manual' | 'auto';
type Panel = 'stats' | 'settings' | null;

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface FloatText {
  id: number;
  x: number;
  y: number;
}

interface Burst {
  id: number;
  x: number;
  y: number;
  seeds: { dx: number; dy: number; size: number; delay: number }[];
}

const sceneMotes = [
  { left: '12%', top: '68%', delay: '0s', duration: '13s', size: 3 },
  { left: '23%', top: '42%', delay: '-4s', duration: '17s', size: 2 },
  { left: '38%', top: '78%', delay: '-8s', duration: '15s', size: 2.5 },
  { left: '56%', top: '34%', delay: '-2s', duration: '19s', size: 2 },
  { left: '71%', top: '62%', delay: '-11s', duration: '14s', size: 3 },
  { left: '84%', top: '48%', delay: '-6s', duration: '16s', size: 2 },
  { left: '91%', top: '74%', delay: '-9s', duration: '18s', size: 2.5 },
];

export default function App() {
  const [store, setStore] = useState<Store>(() => loadStore());
  const { settings, progress } = store;

  const [panel, setPanel] = useState<Panel>(null);
  const [autoOn, setAutoOn] = useState(false);
  const [combo, setCombo] = useState(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [floats, setFloats] = useState<FloatText[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);

  const storeRef = useRef(store);
  const settingsRef = useRef(settings);
  const soundRef = useRef<SoundEngine | null>(null);
  const fishRef = useRef<HTMLSpanElement>(null);
  const malletRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const lastTapAt = useRef(0);
  const comboRef = useRef(0);
  const effectId = useRef(0);
  const toastId = useRef(0);
  const toastTimers = useRef<number[]>([]);
  const seenAchievements = useRef<Set<string> | null>(null);
  const tapRef = useRef<(source: TapSource, point?: { x: number; y: number }) => void>(() => undefined);

  const level = levelFor(progress.total);

  useEffect(() => {
    storeRef.current = store;
    settingsRef.current = settings;
  }, [store, settings]);

  /* Persistence ----------------------------------------------------- */
  useEffect(() => {
    const timer = window.setTimeout(() => saveStore(storeRef.current), 220);
    return () => window.clearTimeout(timer);
  }, [store]);

  useEffect(() => {
    const flush = () => saveStore(storeRef.current);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', flush);
    };
  }, []);

  /* Theme ----------------------------------------------------------- */
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', settings.theme === 'dark' ? '#151d21' : '#f3ebdb');
  }, [settings.theme]);

  /* Title ----------------------------------------------------------- */
  useEffect(() => {
    document.title =
      progress.total > 0 ? `功德 ${formatNumber(progress.total)} · 电子木鱼` : '电子木鱼 · 一念一功德';
  }, [progress.total]);

  /* Sound ----------------------------------------------------------- */
  const getSound = useCallback(() => {
    if (!soundRef.current) soundRef.current = new SoundEngine();
    const current = settingsRef.current;
    soundRef.current.setVolume(current.muted ? 0 : current.volume);
    return soundRef.current;
  }, []);

  useEffect(() => {
    soundRef.current?.setVolume(settings.muted ? 0 : settings.volume);
  }, [settings.volume, settings.muted]);

  useEffect(() => {
    return () => {
      soundRef.current?.dispose();
      toastTimers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  /* Toasts ---------------------------------------------------------- */
  const pushToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = toastId.current + 1;
    toastId.current = id;
    setToasts((list) => [...list, { ...toast, id }].slice(-3));
    const timer = window.setTimeout(() => {
      setToasts((list) => list.filter((item) => item.id !== id));
    }, 4200);
    toastTimers.current.push(timer);
  }, []);

  useEffect(() => {
    if (seenAchievements.current === null) {
      seenAchievements.current = new Set(progress.achievements);
      return;
    }
    const fresh = ACHIEVEMENTS.filter(
      (item) => progress.achievements.includes(item.id) && !seenAchievements.current?.has(item.id),
    );
    if (fresh.length === 0) return;
    fresh.forEach((item) => seenAchievements.current?.add(item.id));
    fresh.forEach((item) => {
      pushToast({ kind: 'achievement', title: `成就 · ${item.name}`, desc: item.desc, char: item.char });
    });
    if (!settingsRef.current.muted) soundRef.current?.chime();
  }, [progress.achievements, pushToast]);

  /* Visual feedback ------------------------------------------------ */
  const isCalm = useCallback(() => {
    if (settingsRef.current.reducedMotion) return true;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }, []);

  const playVisuals = useCallback(
    (source: TapSource, point?: { x: number; y: number }) => {
      if (isCalm()) return;
      const zone = zoneRef.current;
      const rect = zone?.getBoundingClientRect();
      const id = effectId.current + 1;
      effectId.current = id;

      const x = point?.x ?? (rect ? rect.width * (0.4 + Math.random() * 0.2) : 0);
      const y = point?.y ?? (rect ? rect.height * (0.36 + Math.random() * 0.1) : 0);

      setRipples((list) => [...list.slice(-4), { id, x, y }]);
      setFloats((list) => [...list.slice(-5), { id, x: x + (Math.random() * 24 - 12), y: y - 28 }]);

      if (source === 'manual') {
        const seeds = Array.from({ length: 6 }, () => {
          const angle = Math.random() * Math.PI * 2;
          const distance = 26 + Math.random() * 58;
          return {
            dx: Math.cos(angle) * distance,
            dy: Math.sin(angle) * distance - 18,
            size: 2 + Math.random() * 3,
            delay: Math.random() * 90,
          };
        });
        setBursts((list) => [...list.slice(-2), { id, x, y, seeds }]);
        window.setTimeout(() => {
          setBursts((list) => list.filter((item) => item.id !== id));
        }, 780);
      }

      window.setTimeout(() => {
        setRipples((list) => list.filter((item) => item.id !== id));
        setFloats((list) => list.filter((item) => item.id !== id));
      }, 950);

      fishRef.current?.animate(
        [
          { transform: 'scale(1) translateY(0)' },
          { transform: 'scale(0.935) translateY(7px)', offset: 0.32 },
          { transform: 'scale(1.012) translateY(-2px)', offset: 0.7 },
          { transform: 'scale(1) translateY(0)' },
        ],
        { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' },
      );
      malletRef.current?.animate(
        [
          { transform: 'rotate(-25deg)' },
          { transform: 'rotate(15deg)', offset: 0.34 },
          { transform: 'rotate(-25deg)' },
        ],
        { duration: 280, easing: 'ease-out' },
      );
      flashRef.current?.animate([{ opacity: 0.55 }, { opacity: 0 }], {
        duration: 460,
        easing: 'ease-out',
      });
    },
    [isCalm],
  );

  /* Tap ------------------------------------------------------------- */
  const tap = useCallback(
    (source: TapSource, point?: { x: number; y: number }) => {
      const now = Date.now();
      const nextCombo = now - lastTapAt.current <= COMBO_WINDOW ? comboRef.current + 1 : 1;
      lastTapAt.current = now;
      comboRef.current = nextCombo;
      setCombo(nextCombo);

      const current = settingsRef.current;
      if (!current.muted) {
        soundRef.current = soundRef.current ?? new SoundEngine();
        soundRef.current.setVolume(current.volume);
        soundRef.current.play(current.tone);
      }
      if (current.vibration && source === 'manual' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(8);
      }

      setStore((prev) => {
        const today = dayKey();
        const currentProgress = prev.progress;
        const isNewDay = currentProgress.todayKey !== today;
        const todayCount = (isNewDay ? 0 : currentProgress.today) + 1;
        const nextProgress: Progress = {
          ...currentProgress,
          total: currentProgress.total + 1,
          today: todayCount,
          todayKey: today,
          bestCombo: Math.max(currentProgress.bestCombo, nextCombo),
          autoTaps: currentProgress.autoTaps + (source === 'auto' ? 1 : 0),
          history: {
            ...currentProgress.history,
            [today]: (isNewDay ? 0 : currentProgress.history[today] ?? 0) + 1,
          },
        };
        const unlocked = newlyUnlocked(nextProgress, currentProgress.achievements);
        if (unlocked.length > 0) {
          nextProgress.achievements = [...currentProgress.achievements, ...unlocked.map((item) => item.id)];
        }
        return { ...prev, progress: nextProgress };
      });

      playVisuals(source, point);
    },
    [playVisuals],
  );

  useEffect(() => {
    tapRef.current = tap;
  }, [tap]);

  const onFishTap = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = zoneRef.current?.getBoundingClientRect();
    // Keyboard / assistive activation reports detail 0 and no useful
    // coordinates; fall back to the centre of the stage.
    const point =
      rect && event.detail > 0
        ? { x: event.clientX - rect.left, y: event.clientY - rect.top }
        : undefined;
    tap('manual', point);
  };

  /* Combo decay ----------------------------------------------------- */
  useEffect(() => {
    if (combo < 2) return;
    const timer = window.setTimeout(() => {
      comboRef.current = 0;
      setCombo(0);
    }, COMBO_WINDOW + 60);
    return () => window.clearTimeout(timer);
  }, [combo]);

  /* Auto tap -------------------------------------------------------- */
  const toggleAuto = useCallback(() => {
    setAutoOn((value) => !value);
    // Unlock the audio context inside the user gesture.
    getSound();
  }, [getSound]);

  useEffect(() => {
    if (!autoOn) return;
    const interval = window.setInterval(() => {
      tapRef.current('auto');
    }, 60000 / settings.autoBpm);
    return () => window.clearInterval(interval);
  }, [autoOn, settings.autoBpm]);

  /* Settings -------------------------------------------------------- */
  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setStore((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  const toggleMute = useCallback(() => {
    const nextMuted = !settingsRef.current.muted;
    setStore((prev) => ({ ...prev, settings: { ...prev.settings, muted: nextMuted } }));
    if (!nextMuted) {
      const engine = soundRef.current ?? new SoundEngine();
      soundRef.current = engine;
      engine.setVolume(settingsRef.current.volume);
      engine.play(settingsRef.current.tone);
    }
  }, []);

  const previewTone = useCallback(
    (tone: Tone) => {
      const engine = getSound();
      engine.play(tone);
    },
    [getSound],
  );

  const selectSkin = useCallback(
    (skin: SkinId) => {
      const target = SKINS.find((item) => item.id === skin);
      if (!target || !skinUnlocked(target, storeRef.current.progress.total)) return;
      updateSettings({ skin });
      pushToast({
        kind: 'info',
        title: `已换上${target.name}木鱼`,
        desc: target.hint,
        char: '鱼',
      });
    },
    [pushToast, updateSettings],
  );

  const resetProgress = useCallback(() => {
    setStore((prev) => ({
      settings: { ...prev.settings, skin: 'wood' },
      progress: emptyProgress(),
    }));
    seenAchievements.current = new Set();
    comboRef.current = 0;
    lastTapAt.current = 0;
    setCombo(0);
    setAutoOn(false);
    pushToast({ kind: 'info', title: '功德已清零', desc: '从第一声重新开始。', char: '空' });
  }, [pushToast]);

  const shareCard = useCallback(async () => {
    const ok = await downloadMeritCard(storeRef.current.progress, storeRef.current.settings.theme);
    pushToast(
      ok
        ? { kind: 'info', title: '功德卡已生成', desc: '请查收浏览器下载的图片。', char: '卡' }
        : { kind: 'info', title: '生成失败', desc: '换个浏览器再试试。', char: '叹' },
    );
    return ok;
  }, [pushToast]);

  /* Keyboard -------------------------------------------------------- */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (panel !== null) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;

      if (event.code === 'Space' || event.code === 'Enter') {
        // Let focused buttons activate natively (the fish button is a button).
        if (target?.closest('button')) return;
        event.preventDefault();
        if (!event.repeat) tapRef.current('manual');
      } else if (event.code === 'KeyA') {
        if (event.repeat) return;
        event.preventDefault();
        toggleAuto();
      } else if (event.code === 'KeyM') {
        if (event.repeat) return;
        event.preventDefault();
        toggleMute();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleAuto, toggleMute, panel]);

  const activeSkin = SKINS.find((item) => item.id === settings.skin) ?? SKINS[0];

  return (
    <div className={`app${settings.reducedMotion ? ' is-calm' : ''}`}>
      <div className="scene" aria-hidden="true">
        <div className="scene-sun" />
        <div className="scene-cloud scene-cloud--one" />
        <div className="scene-cloud scene-cloud--two" />
        <div className="scene-cloud scene-cloud--three" />
        <svg className="mountains" viewBox="0 0 1440 500" preserveAspectRatio="none">
          <path
            className="mountain mountain--far"
            d="M0 358C110 300 188 252 300 296c86 33 128 4 218-52 92-57 166 30 268 48 105 19 180-56 284-74 102-18 184 70 370 38v244H0Z"
          />
          <path
            className="mountain mountain--mid"
            d="M0 402c102-30 178-72 278-40 122 37 192-30 302-30s180 60 300 50c118-10 208-60 318-40 100 18 160 50 242 30v128H0Z"
          />
          <path
            className="mountain mountain--near"
            d="M0 452c140-30 240-52 360-32 120 20 200-10 340-15 140-5 230 40 360 35 120-5 240-35 380-15v75H0Z"
          />
          <g className="birds">
            <path d="M978 152c9-8 17-8 26 0 9-8 17-8 26 0" />
            <path d="M1052 186c7-6 13-6 20 0 7-6 13-6 20 0" />
            <path d="M922 210c5-5 10-5 15 0 5-5 10-5 15 0" />
          </g>
        </svg>
        <div className="scene-motes">
          {sceneMotes.map((mote, index) => (
            <span
              key={index}
              style={{
                left: mote.left,
                top: mote.top,
                width: mote.size,
                height: mote.size,
                animationDelay: mote.delay,
                animationDuration: mote.duration,
              }}
            />
          ))}
        </div>
        <div className="scene-grain" />
      </div>

      <header className="topbar">
        <div className="brand">
          <span className="brand-seal" aria-hidden="true">
            木
          </span>
          <div className="brand-text">
            <h1>电子木鱼</h1>
            <p>一念一功德</p>
          </div>
        </div>
        <div className="topbar-actions">
          <button
            type="button"
            className="icon-button"
            onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            aria-label={settings.theme === 'dark' ? '切换到日间模式' : '切换到夜间模式'}
            title={settings.theme === 'dark' ? '日间 · 宣纸' : '夜间 · 墨月'}
          >
            {settings.theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            type="button"
            className={`icon-button${settings.muted ? ' is-off' : ''}`}
            onClick={toggleMute}
            aria-label={settings.muted ? '开启声音' : '关闭声音'}
            aria-pressed={!settings.muted}
            title={settings.muted ? '开启声音 (M)' : '静音 (M)'}
          >
            {settings.muted ? <VolumeOffIcon /> : <VolumeIcon />}
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => setPanel('stats')}
            aria-label="查看修行录"
            title="修行录"
          >
            <ChartIcon />
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => setPanel('settings')}
            aria-label="打开设置"
            title="设置"
          >
            <SlidersIcon />
          </button>
        </div>
      </header>

      <aside className="verse" aria-hidden="true">
        <span>一念一功德</span>
        <i>静</i>
      </aside>

      <main className="main">
        <section className="merit-board" aria-label="功德统计">
          <div className="merit-heading">
            <span className="merit-rule" />
            <span>功德</span>
            <span className="merit-rule" />
          </div>
          <div className="merit-line">
            <strong className="merit-count" key={progress.total}>
              {formatNumber(progress.total)}
            </strong>
            <span className="merit-unit">点</span>
          </div>
          <div className="merit-meta">
            <span>
              今日 <b>+{formatNumber(progress.today)}</b>
            </span>
            <span className={`merit-combo${combo >= 2 ? ' is-hot' : ''}`}>
              连击 <b>{combo >= 2 ? `×${combo}` : '—'}</b>
            </span>
            <span className="merit-level">{level.level.name}</span>
          </div>
          <div className="level-meter" aria-label={`境界 ${level.level.name}`}>
            <div className="level-track">
              <span style={{ width: `${Math.max(2, level.ratio * 100)}%` }} />
            </div>
            <p>
              {level.next
                ? `再敲 ${formatNumber(level.remaining)} 声，晋入「${level.next.name}」`
                : '功德圆满，继续静心'}
            </p>
          </div>
        </section>

        <section className="fish-zone" data-skin={settings.skin} ref={zoneRef}>
          <div className="enso" aria-hidden="true" />
          <button
            type="button"
            className="fish-button"
            data-skin={settings.skin}
            onClick={onFishTap}
            aria-label="敲木鱼，功德加一"
          >
            <span className="fish-inner" ref={fishRef}>
              <WoodenFish skin={settings.skin} />
            </span>
          </button>
          <div className="mallet" ref={malletRef} aria-hidden="true">
            <Mallet />
          </div>
          <div className="hit-flash" ref={flashRef} aria-hidden="true" />
          <div className="effect-layer" aria-hidden="true">
            {ripples.map((ripple) => (
              <span className="ripple" key={ripple.id} style={{ left: ripple.x, top: ripple.y }} />
            ))}
            {floats.map((float) => (
              <span className="float" key={float.id} style={{ left: float.x, top: float.y }}>
                +1
              </span>
            ))}
            {bursts.map((burst) => (
              <span className="burst" key={burst.id} style={{ left: burst.x, top: burst.y }}>
                {burst.seeds.map((seed, index) => (
                  <i
                    key={index}
                    style={
                      {
                        '--dx': `${seed.dx}px`,
                        '--dy': `${seed.dy}px`,
                        '--size': `${seed.size}px`,
                        animationDelay: `${seed.delay}ms`,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </span>
            ))}
          </div>
          <p className="fish-hint">
            <span>轻触木鱼</span>
            <span className="dot">·</span>
            <span className="key-hint">
              <kbd>空格</kbd> 也可
            </span>
          </p>
        </section>

        <section className="dock" aria-label="敲击控制">
          <button
            type="button"
            className={`auto-button${autoOn ? ' is-on' : ''}`}
            onClick={toggleAuto}
            aria-pressed={autoOn}
          >
            <span className="auto-icon">{autoOn ? <PauseIcon /> : <PlayIcon />}</span>
            <span className="auto-copy">
              <strong>{autoOn ? '自动敲击中' : '自动敲击'}</strong>
              <small>{autoOn ? '点击暂停 · A' : '解放双手 · A'}</small>
            </span>
            <span className={`auto-pulse${autoOn ? ' is-live' : ''}`} aria-hidden="true" />
          </button>

          <div className={`bpm-control${autoOn ? ' is-active' : ''}`}>
            <div className="bpm-head">
              <span>速度</span>
              <b>{settings.autoBpm} BPM</b>
            </div>
            <input
              className="range"
              type="range"
              min={30}
              max={240}
              step={5}
              value={settings.autoBpm}
              aria-label="自动敲击速度"
              onChange={(event) => updateSettings({ autoBpm: Number(event.target.value) })}
              style={{ '--fill': `${((settings.autoBpm - 30) / 210) * 100}%` } as React.CSSProperties}
            />
          </div>

          <div className="dock-hint" title="按 A 切换自动敲击，M 静音">
            <KeyboardIcon />
            <span>A 自动 · M 静音</span>
          </div>
        </section>

        <p className="stage-caption">
          <span className={`live-dot${autoOn ? ' is-live' : ''}`} />
          {autoOn ? '木鱼声声，自动修行中' : settings.reducedMotion ? '静默模式 · 心随声动' : '静心片刻，功德自增'}
        </p>
      </main>

      <footer className="site-footer">
        <span>数据仅保存在本机</span>
        <span className="footer-sep">·</span>
        <span>{activeSkin.name}木鱼</span>
        <span className="footer-sep">·</span>
        <span>v1.0</span>
      </footer>

      <Toasts items={toasts} onDismiss={(id) => setToasts((list) => list.filter((item) => item.id !== id))} />

      <StatsSheet
        open={panel === 'stats'}
        onClose={() => setPanel(null)}
        progress={progress}
        skin={settings.skin}
        onSelectSkin={selectSkin}
        onShare={shareCard}
      />

      <SettingsSheet
        open={panel === 'settings'}
        onClose={() => setPanel(null)}
        settings={settings}
        onChange={updateSettings}
        onPreviewTone={previewTone}
        onReset={resetProgress}
      />
    </div>
  );
}
