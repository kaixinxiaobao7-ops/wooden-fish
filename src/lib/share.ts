import { dayKey, formatNumber, levelFor, type Progress } from './game';

interface Palette {
  dark: boolean;
  paper: string;
  paperDeep: string;
  ink: string;
  inkSoft: string;
  gold: string;
  goldSoft: string;
  cinnabar: string;
  line: string;
  mountainA: string;
  mountainB: string;
  mountainC: string;
  moon: string;
  moonGlow: string;
}

function paletteFor(theme: 'light' | 'dark'): Palette {
  if (theme === 'dark') {
    return {
      dark: true,
      paper: '#151d21',
      paperDeep: '#0b1013',
      ink: '#f0e6d2',
      inkSoft: '#b7a98e',
      gold: '#d8ab63',
      goldSoft: '#eed7a6',
      cinnabar: '#cd6153',
      line: 'rgba(240,230,210,0.16)',
      mountainA: 'rgba(150,175,170,0.10)',
      mountainB: 'rgba(125,152,146,0.14)',
      mountainC: 'rgba(98,124,119,0.22)',
      moon: '#f2e6c6',
      moonGlow: 'rgba(242,230,198,0.20)',
    };
  }
  return {
    dark: false,
    paper: '#f3ebdb',
    paperDeep: '#e6dac3',
    ink: '#2f2921',
    inkSoft: '#756754',
    gold: '#a9792f',
    goldSoft: '#d8b36d',
    cinnabar: '#ad3d2f',
    line: 'rgba(60,47,30,0.16)',
    mountainA: 'rgba(88,107,97,0.12)',
    mountainB: 'rgba(70,91,82,0.18)',
    mountainC: 'rgba(53,73,65,0.26)',
    moon: '#e8b27c',
    moonGlow: 'rgba(232,178,124,0.32)',
  };
}

function drawMountains(ctx: CanvasRenderingContext2D, width: number, height: number, palette: Palette) {
  const layers = [
    {
      color: palette.mountainA,
      path: 'M0 690 C 120 630 200 570 330 610 C 450 648 520 600 640 560 C 760 520 840 610 960 620 C 1080 630 1160 560 1280 560 C 1380 560 1400 600 1440 590 L1440 960 L0 960 Z',
    },
    {
      color: palette.mountainB,
      path: 'M0 750 C 130 720 230 650 360 680 C 490 710 580 650 700 645 C 820 640 900 700 1020 700 C 1140 700 1240 640 1340 660 C 1400 672 1420 690 1440 690 L1440 960 L0 960 Z',
    },
    {
      color: palette.mountainC,
      path: 'M0 820 C 160 790 260 750 400 770 C 540 790 640 760 780 758 C 920 756 1020 800 1160 796 C 1290 792 1370 760 1440 775 L1440 960 L0 960 Z',
    },
  ];
  layers.forEach((layer) => {
    const path = new Path2D(layer.path);
    ctx.fillStyle = layer.color;
    ctx.fill(path);
  });
  // Mist that softens the mountain bases.
  const mist = ctx.createLinearGradient(0, height * 0.68, 0, height);
  mist.addColorStop(0, palette.dark ? 'rgba(21,29,33,0)' : 'rgba(243,235,219,0)');
  mist.addColorStop(1, palette.dark ? 'rgba(11,16,19,0.55)' : 'rgba(230,218,195,0.65)');
  ctx.fillStyle = mist;
  ctx.fillRect(0, height * 0.68, width, height * 0.32);
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  color: string,
  spacing = 0,
) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  if (spacing === 0) {
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
    return;
  }
  const chars = Array.from(text);
  const widths = chars.map((char) => ctx.measureText(char).width);
  const total = widths.reduce((sum, width) => sum + width, 0) + spacing * (chars.length - 1);
  let cursor = x - total / 2;
  chars.forEach((char, index) => {
    ctx.fillText(char, cursor, y);
    cursor += widths[index] + spacing;
  });
}

export function meritCardBlob(progress: Progress, theme: 'light' | 'dark'): Promise<Blob | null> {
  const width = 720;
  const height = 960;
  const scale = 2;
  const palette = paletteFor(theme);
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.resolve(null);
  ctx.scale(scale, scale);

  // Paper.
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, palette.paper);
  bg.addColorStop(1, palette.paperDeep);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Moon / sun.
  const moonX = 596;
  const moonY = 156;
  const moonR = 78;
  const glow = ctx.createRadialGradient(moonX, moonY, moonR * 0.4, moonX, moonY, moonR * 2.6);
  glow.addColorStop(0, palette.moonGlow);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(moonX - moonR * 2.6, moonY - moonR * 2.6, moonR * 5.2, moonR * 5.2);
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.fillStyle = palette.moon;
  ctx.globalAlpha = palette.dark ? 0.9 : 0.85;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Enso ring behind the count.
  ctx.beginPath();
  ctx.arc(360, 470, 244, Math.PI * 0.72, Math.PI * 2.12);
  ctx.strokeStyle = palette.gold;
  ctx.globalAlpha = 0.22;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Mountains.
  drawMountains(ctx, width, height, palette);

  // Fine border and corner marks.
  ctx.strokeStyle = palette.line;
  ctx.lineWidth = 1.4;
  roundedRect(ctx, 30, 30, width - 60, height - 60, 6);
  ctx.stroke();
  ctx.strokeStyle = palette.gold;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1.6;
  const corner = 26;
  [
    [30, 30, 1, 1],
    [width - 30, 30, -1, 1],
    [30, height - 30, 1, -1],
    [width - 30, height - 30, -1, -1],
  ].forEach(([x, y, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(x + dx * corner, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * corner);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;

  // Title.
  drawCenteredText(ctx, '电 子 木 鱼', 360, 118, '500 28px "Songti SC", "Noto Serif SC", serif', palette.ink, 2);
  drawCenteredText(ctx, '一 念 一 功 德', 360, 154, '400 13px "PingFang SC", "Noto Sans SC", sans-serif', palette.inkSoft, 3);
  ctx.strokeStyle = palette.gold;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(320, 174);
  ctx.lineTo(400, 174);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Big merit number.
  const level = levelFor(progress.total);
  drawCenteredText(
    ctx,
    '功　德',
    360,
    306,
    '400 22px "Songti SC", "Noto Serif SC", serif',
    palette.inkSoft,
    8,
  );
  const count = formatNumber(progress.total);
  const countSize = count.length > 8 ? 96 : count.length > 6 ? 116 : 152;
  drawCenteredText(
    ctx,
    count,
    360,
    430,
    `600 ${countSize}px "Songti SC", "Noto Serif SC", serif`,
    palette.ink,
    0,
  );
  ctx.font = `600 ${countSize}px "Songti SC", "Noto Serif SC", serif`;
  const countWidth = ctx.measureText(count).width;
  drawCenteredText(
    ctx,
    '点',
    360 + countWidth / 2 + 18,
    458,
    '400 18px "PingFang SC", sans-serif',
    palette.inkSoft,
  );

  // Level pill.
  const levelText = `${level.level.name} · ${level.level.roman}`;
  ctx.font = '500 15px "PingFang SC", "Noto Sans SC", sans-serif';
  const pillWidth = ctx.measureText(levelText).width + 48;
  ctx.strokeStyle = palette.gold;
  ctx.globalAlpha = 0.6;
  roundedRect(ctx, 360 - pillWidth / 2, 520, pillWidth, 40, 20);
  ctx.stroke();
  ctx.globalAlpha = 1;
  drawCenteredText(
    ctx,
    levelText,
    360,
    540,
    '500 15px "PingFang SC", "Noto Sans SC", sans-serif',
    palette.gold,
    1,
  );

  // Stats.
  const stats: { label: string; value: string }[] = [
    { label: '今 日', value: `+${formatNumber(progress.today)}` },
    { label: '最 高 连 击', value: `×${formatNumber(progress.bestCombo)}` },
    { label: '境 界', value: level.level.name },
  ];
  const statY = 664;
  stats.forEach((stat, index) => {
    const centerX = 186 + index * 174;
    drawCenteredText(ctx, stat.label, centerX, statY, '400 12px "PingFang SC", sans-serif', palette.inkSoft, 1);
    drawCenteredText(
      ctx,
      stat.value,
      centerX,
      statY + 44,
      '600 30px "Songti SC", "Noto Serif SC", serif',
      palette.ink,
    );
    if (index < stats.length - 1) {
      ctx.strokeStyle = palette.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX + 87, statY - 12);
      ctx.lineTo(centerX + 87, statY + 62);
      ctx.stroke();
    }
  });

  ctx.strokeStyle = palette.line;
  ctx.beginPath();
  ctx.moveTo(90, 760);
  ctx.lineTo(630, 760);
  ctx.stroke();

  // Date and tagline.
  const today = new Date();
  drawCenteredText(
    ctx,
    `${today.getFullYear()} 年 ${today.getMonth() + 1} 月 ${today.getDate()} 日`,
    90,
    806,
    '400 15px "PingFang SC", "Noto Sans SC", sans-serif',
    palette.inkSoft,
    1,
  );
  drawCenteredText(
    ctx,
    '静 心 敲 击 · 功 德 自 增',
    90,
    842,
    '400 12px "PingFang SC", sans-serif',
    palette.inkSoft,
    2,
  );
  drawCenteredText(
    ctx,
    'wooden-fish',
    90,
    872,
    '400 11px ui-monospace, monospace',
    palette.inkSoft,
    1,
  );

  // Seal.
  ctx.save();
  ctx.translate(560, 816);
  ctx.rotate(-0.05);
  ctx.fillStyle = palette.cinnabar;
  roundedRect(ctx, -46, -46, 92, 92, 6);
  ctx.fill();
  ctx.strokeStyle = palette.paper;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1.5;
  roundedRect(ctx, -39, -39, 78, 78, 3);
  ctx.stroke();
  ctx.globalAlpha = 1;
  drawCenteredText(
    ctx,
    '功',
    0,
    -17,
    '600 30px "Songti SC", "Noto Serif SC", serif',
    '#f7efdd',
  );
  drawCenteredText(
    ctx,
    '德',
    0,
    20,
    '600 30px "Songti SC", "Noto Serif SC", serif',
    '#f7efdd',
  );
  ctx.restore();

  drawCenteredText(
    ctx,
    `已修行 ${Math.max(1, Object.keys(progress.history).length)} 天`,
    360,
    908,
    '400 11px "PingFang SC", sans-serif',
    palette.inkSoft,
    1,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

export async function downloadMeritCard(progress: Progress, theme: 'light' | 'dark'): Promise<boolean> {
  try {
    const blob = await meritCardBlob(progress, theme);
    if (!blob) return false;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wooden-fish-${dayKey()}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
    return true;
  } catch {
    return false;
  }
}

export function shareText(progress: Progress): string {
  const level = levelFor(progress.total);
  return `今日已敲 ${formatNumber(progress.today)} 声木鱼，累计功德 ${formatNumber(progress.total)} 点，境界「${level.level.name}」。`;
}
