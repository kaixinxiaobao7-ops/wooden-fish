import { useState } from 'react';
import { Sheet } from './Sheet';
import {
  ACHIEVEMENTS,
  SKINS,
  formatNumber,
  lastSevenDays,
  levelFor,
  skinUnlocked,
  type Progress,
  type SkinId,
} from '../lib/game';
import { ShareIcon } from './Icons';

interface StatsSheetProps {
  open: boolean;
  onClose: () => void;
  progress: Progress;
  skin: SkinId;
  onSelectSkin: (skin: SkinId) => void;
  onShare: () => Promise<boolean>;
}

export function StatsSheet({ open, onClose, progress, skin, onSelectSkin, onShare }: StatsSheetProps) {
  const level = levelFor(progress.total);
  const days = lastSevenDays(progress.history, progress.today);
  const peak = Math.max(1, ...days.map((day) => day.value));
  const unlocked = new Set(progress.achievements);
  const activeSkin = SKINS.find((item) => item.id === skin) ?? SKINS[0];
  const [shareState, setShareState] = useState<'idle' | 'working' | 'done' | 'error'>('idle');

  const handleShare = async () => {
    if (shareState === 'working') return;
    setShareState('working');
    const ok = await onShare();
    setShareState(ok ? 'done' : 'error');
    window.setTimeout(() => setShareState('idle'), 2600);
  };

  const shareLabel =
    shareState === 'working'
      ? '正在生成功德卡…'
      : shareState === 'done'
        ? '已生成，请查收下载'
        : shareState === 'error'
          ? '生成失败，请重试'
          : '生成功德卡';

  return (
    <Sheet open={open} onClose={onClose} title="修行录" subtitle={`${level.level.name} · 第 ${level.index + 1} 境`}>
      <div className="stat-grid">
        <div className="stat-card">
          <span>累计功德</span>
          <strong>{formatNumber(progress.total)}</strong>
        </div>
        <div className="stat-card">
          <span>今日功德</span>
          <strong>{formatNumber(progress.today)}</strong>
        </div>
        <div className="stat-card">
          <span>最高连击</span>
          <strong>×{formatNumber(progress.bestCombo)}</strong>
        </div>
        <div className="stat-card">
          <span>自动敲击</span>
          <strong>{formatNumber(progress.autoTaps)}</strong>
        </div>
      </div>

      <section className="panel-section">
        <div className="panel-heading">
          <h3>七日修行</h3>
          <span>单位：功德</span>
        </div>
        <div className="chart" role="img" aria-label="最近七天的功德柱状图">
          {days.map((day) => (
            <div className={`chart-col${day.isToday ? ' is-today' : ''}`} key={day.key}>
              <span className="chart-value">{day.value > 0 ? formatNumber(day.value) : ''}</span>
              <div className="chart-track">
                <div
                  className="chart-bar"
                  style={{ height: `${Math.max(day.value > 0 ? 8 : 2, (day.value / peak) * 100)}%` }}
                />
              </div>
              <span className="chart-label">{day.isToday ? '今日' : `周${day.label}`}</span>
              <span className="chart-date">{day.full}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <div className="panel-heading">
          <h3>木鱼</h3>
          <span>累计功德解锁</span>
        </div>
        <div className="skin-list">
          {SKINS.map((item) => {
            const unlockedSkin = skinUnlocked(item, progress.total);
            return (
              <button
                key={item.id}
                type="button"
                className={`skin-card${skin === item.id ? ' is-active' : ''}${unlockedSkin ? '' : ' is-locked'}`}
                onClick={() => unlockedSkin && onSelectSkin(item.id)}
                disabled={!unlockedSkin}
                aria-pressed={skin === item.id}
              >
                <span className={`skin-swatch skin-swatch--${item.id}`} aria-hidden="true" />
                <span className="skin-meta">
                  <strong>{item.name}</strong>
                  <small>{unlockedSkin ? item.hint : `还差 ${formatNumber(item.unlockAt - progress.total)} 功德`}</small>
                </span>
                <span className="skin-state">
                  {skin === item.id ? '使用中' : unlockedSkin ? '选择' : '未解锁'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel-section">
        <div className="panel-heading">
          <h3>成就</h3>
          <span>
            {unlocked.size} / {ACHIEVEMENTS.length}
          </span>
        </div>
        <div className="achievement-grid">
          {ACHIEVEMENTS.map((item) => {
            const done = unlocked.has(item.id);
            return (
              <div className={`achievement${done ? ' is-done' : ''}`} key={item.id} title={item.desc}>
                <span className="achievement-char" aria-hidden="true">
                  {item.char}
                </span>
                <span className="achievement-text">
                  <strong>{item.name}</strong>
                  <small>{item.desc}</small>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="share-wrap">
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            void handleShare();
          }}
          disabled={shareState === 'working'}
        >
          <ShareIcon />
          {shareLabel}
        </button>
        <p>保存一张今日修行卡片，分享这份清净。</p>
      </div>

      <p className="sheet-note">
        当前木鱼：{activeSkin.name} · 数据仅存于本机浏览器，清除网站数据会一并清空。
      </p>
    </Sheet>
  );
}
