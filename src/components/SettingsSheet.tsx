import { useState } from 'react';
import { Sheet } from './Sheet';
import type { Settings, Tone } from '../lib/game';
import { ResetIcon } from './Icons';

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onPreviewTone: (tone: Tone) => void;
  onReset: () => void;
}

const tones: { id: Tone; name: string; hint: string }[] = [
  { id: 'wood', name: '木鱼', hint: '清脆' },
  { id: 'bell', name: '铜磬', hint: '悠远' },
  { id: 'electronic', name: '电子', hint: '未来' },
];

export function SettingsSheet({ open, onClose, settings, onChange, onPreviewTone, onReset }: SettingsSheetProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <Sheet open={open} onClose={onClose} title="设置" subtitle="调成你喜欢的样子">
      <section className="setting-group">
        <h3>外观</h3>
        <div className="segmented" role="group" aria-label="主题">
          <button
            type="button"
            className={settings.theme === 'light' ? 'is-active' : ''}
            aria-pressed={settings.theme === 'light'}
            onClick={() => onChange({ theme: 'light' })}
          >
            日间 · 宣纸
          </button>
          <button
            type="button"
            className={settings.theme === 'dark' ? 'is-active' : ''}
            aria-pressed={settings.theme === 'dark'}
            onClick={() => onChange({ theme: 'dark' })}
          >
            夜间 · 墨月
          </button>
        </div>
      </section>

      <section className="setting-group">
        <h3>音色</h3>
        <div className="segmented segmented--three" role="group" aria-label="音色">
          {tones.map((tone) => (
            <button
              key={tone.id}
              type="button"
              className={settings.tone === tone.id ? 'is-active' : ''}
              aria-pressed={settings.tone === tone.id}
              onClick={() => {
                onChange({ tone: tone.id });
                onPreviewTone(tone.id);
              }}
            >
              <span>{tone.name}</span>
              <small>{tone.hint}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="setting-group">
        <div className="setting-row">
          <div>
            <h3>音量</h3>
            <p>轻一点，也很清楚</p>
          </div>
          <output className="setting-value">{Math.round(settings.volume * 100)}%</output>
        </div>
        <input
          className="range"
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(settings.volume * 100)}
          aria-label="音量"
          onChange={(event) => onChange({ volume: Number(event.target.value) / 100, muted: false })}
          style={{ '--fill': `${Math.round(settings.volume * 100)}%` } as React.CSSProperties}
        />
      </section>

      <section className="setting-group">
        <div className="setting-row">
          <div>
            <h3>自动敲击速度</h3>
            <p>每 {settings.autoBpm} 次 / 分钟</p>
          </div>
          <output className="setting-value">{settings.autoBpm} BPM</output>
        </div>
        <input
          className="range"
          type="range"
          min={30}
          max={240}
          step={5}
          value={settings.autoBpm}
          aria-label="自动敲击速度"
          onChange={(event) => onChange({ autoBpm: Number(event.target.value) })}
          style={{ '--fill': `${((settings.autoBpm - 30) / 210) * 100}%` } as React.CSSProperties}
        />
      </section>

      <section className="setting-group">
        <h3>反馈</h3>
        <label className="toggle-row">
          <span>
            振动反馈
            <small>支持振动的设备上，每次敲击轻震一下</small>
          </span>
          <input
            type="checkbox"
            checked={settings.vibration}
            onChange={(event) => onChange({ vibration: event.target.checked })}
          />
          <span className="switch" aria-hidden="true" />
        </label>
        <label className="toggle-row">
          <span>
            减少动效
            <small>关闭涟漪、飞屑与缩放动画</small>
          </span>
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(event) => onChange({ reducedMotion: event.target.checked })}
          />
          <span className="switch" aria-hidden="true" />
        </label>
      </section>

      <section className="setting-group setting-group--danger">
        <h3>重新开始</h3>
        {confirming ? (
          <div className="reset-confirm">
            <p>功德、统计与成就会被清空，确定吗？</p>
            <div className="reset-actions">
              <button type="button" className="text-button" onClick={() => setConfirming(false)}>
                再想想
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => {
                  onReset();
                  setConfirming(false);
                  onClose();
                }}
              >
                确认清空
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="reset-button" onClick={() => setConfirming(true)}>
            <ResetIcon />
            清空所有功德
          </button>
        )}
      </section>

      <p className="sheet-note">所有数据只保存在你的浏览器里，不上传、不联网。</p>
    </Sheet>
  );
}
