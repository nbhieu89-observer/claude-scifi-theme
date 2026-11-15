import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// Deterministic star positions so the scene is identical on every reload.
function makeStars(count: number, seed: number): string {
  let s = seed
  const rand = (): number => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    const x = (rand() * 1600).toFixed(1)
    const y = (rand() * 620).toFixed(1)
    const r = (0.4 + rand() * 1.3).toFixed(2)
    const cls = i % 3 === 0 ? 'tw a' : i % 3 === 1 ? 'tw b' : 'tw c'
    out.push(`<circle class="${cls}" cx="${x}" cy="${y}" r="${r}"/>`)
  }
  return out.join('')
}

// Perspective floor grid converging on a vanishing point at (800, 620).
function makeGrid(): string {
  const lines: string[] = []
  for (let i = -16; i <= 16; i++) {
    lines.push(`<line x1="800" y1="620" x2="${800 + i * 140}" y2="1000"/>`)
  }
  return lines.join('')
}

const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<defs>
  <radialGradient id="sky" cx="50%" cy="62%" r="75%">
    <stop offset="0" stop-color="#14254a"/>
    <stop offset="0.45" stop-color="#0a1430"/>
    <stop offset="1" stop-color="#04070f"/>
  </radialGradient>
  <radialGradient id="neb1" cx="50%" cy="50%" r="50%">
    <stop offset="0" stop-color="#7a3cff" stop-opacity="0.35"/>
    <stop offset="1" stop-color="#7a3cff" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="neb2" cx="50%" cy="50%" r="50%">
    <stop offset="0" stop-color="#00e5ff" stop-opacity="0.22"/>
    <stop offset="1" stop-color="#00e5ff" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="horizon" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#00e5ff" stop-opacity="0"/>
    <stop offset="0.5" stop-color="#00e5ff" stop-opacity="0.55"/>
    <stop offset="1" stop-color="#00e5ff" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#04070f" stop-opacity="1"/>
    <stop offset="1" stop-color="#04070f" stop-opacity="0"/>
  </linearGradient>
  <clipPath id="floor"><rect x="0" y="620" width="1600" height="380"/></clipPath>
</defs>
<style>
  .tw { fill: #cfeaff; }
  .a { animation: tw 4s ease-in-out infinite; }
  .b { animation: tw 6s ease-in-out infinite 1.5s; }
  .c { animation: tw 9s ease-in-out infinite 3s; opacity: .5; }
  @keyframes tw { 0%,100% { opacity: .25 } 50% { opacity: 1 } }
  .neb { animation: drift 40s ease-in-out infinite alternate; }
  @keyframes drift { from { transform: translate(0,0) } to { transform: translate(60px,-30px) } }
  .grid line { stroke: #00e5ff; stroke-width: 1; opacity: .28; }
  .hz { stroke: #00e5ff; stroke-width: 1; opacity: .22; animation: run 3s linear infinite; }
  @keyframes run { from { transform: translateY(0) } to { transform: translateY(60px) } }
  .ring { fill: none; stroke: #00e5ff; transform-box: fill-box; transform-origin: center; }
  .r1 { stroke-width: 1.2; opacity: .35; stroke-dasharray: 6 10; animation: spin 60s linear infinite; }
  .r2 { stroke-width: 2; opacity: .25; stroke-dasharray: 120 40 20 40; animation: spin 90s linear infinite reverse; }
  .r3 { stroke: #b388ff; stroke-width: 1; opacity: .3; stroke-dasharray: 2 6; animation: spin 40s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg) } }
  .scan { fill: #00e5ff; opacity: .05; animation: scan 12s linear infinite; }
  @keyframes scan { from { transform: translateY(-120px) } to { transform: translateY(1100px) } }
  .hud { fill: #00e5ff; font: 12px monospace; opacity: .35; letter-spacing: 2px; }
  .blink { animation: blink 2s steps(2) infinite; }
  @keyframes blink { 50% { opacity: 0 } }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
  @media (max-aspect-ratio: 1/1) { .corner { display: none; } }
</style>
<rect width="1600" height="1000" fill="url(#sky)"/>
<g class="neb">
  <ellipse cx="380" cy="260" rx="520" ry="260" fill="url(#neb1)"/>
  <ellipse cx="1250" cy="380" rx="460" ry="230" fill="url(#neb2)"/>
</g>
<g>${makeStars(170, 42)}</g>
<!-- HUD rings in the upper right, away from the text column -->
<svg class="corner" x="1180" y="40" width="380" height="380" viewBox="0 0 380 380" preserveAspectRatio="xMaxYMin meet">
  <circle class="ring r1" cx="190" cy="190" r="170"/>
  <circle class="ring r2" cx="190" cy="190" r="135"/>
  <circle class="ring r3" cx="190" cy="190" r="100"/>
  <circle cx="190" cy="190" r="3" fill="#00e5ff" opacity=".5"/>
</svg>
<text class="hud corner" x="40" y="60">SYS://NAV-CORE  ONLINE<tspan class="blink"> _</tspan></text>
<text class="hud corner" x="40" y="80">SECTOR 7G · DRIFT 0.003c</text>
<g clip-path="url(#floor)">
  <rect x="0" y="620" width="1600" height="380" fill="#050a18"/>
  <g class="grid">${makeGrid()}</g>
  <g>${[0, 60, 120, 180, 240, 300, 360].map(y => `<line class="hz" x1="0" y1="${620 + y}" x2="1600" y2="${620 + y}"/>`).join('')}</g>
  <rect x="0" y="620" width="1600" height="120" fill="url(#fade)"/>
</g>
<rect x="0" y="612" width="1600" height="16" fill="url(#horizon)"/>
<rect class="scan" x="0" y="0" width="1600" height="90"/>
</svg>`

// Dark-only: the starfield scene only makes sense at night.
const { theme, problems } = makeColors({
  label: 'Sci-fi deep space',
  only: 'dark',
  roles: { accent: '#00e5ff', danger: '#ff4d6d', success: '#3dffa8', warning: '#ffb547', pro: '#b388ff' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#070c1a',
        'surface-1': '#0c1426',
        'surface-2': '#111b31',
        'surface-3': '#16223b',
        'text-primary': '#e6f4ff',
        'text-secondary': '#b4cbe0',
        'text-muted': '#8aa3bd',
      },
    },
  },
})

const LOOK: ThemeSetArgs = {
  colors: theme,
  overrideColorScheme: 'dark',
  backdrop: { scene: 'scifi-deep-space', glass: { blur: 18, tint: '#070c1a', opacity: 0.62 } },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const set = await $.theme.set(LOOK)
    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }
    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)
    return <Svg source={SCENE} alt="Deep space starfield over a glowing neon grid with slowly turning HUD rings" isInteractive />
  })
}
