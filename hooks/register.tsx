import { atom, read, update } from 'claude-code'
import type { Register, RenderChildren, ThemeSetArgs } from 'claude-code'

import type { MediaTexts } from '../types'
import { makeColors } from './make-colors.js'

// Prompts you sent with an image or file: the message row carries only text,
// so the mod notes them as they're sent and keeps the app's own row for them.
const withMedia = atom({ plugin: 'calcjump-retro-theme', key: 'withMedia' } as const, [] as MediaTexts, {
  shape: 'media-1',
})

// Matched to the CalcJump "Claude Mod 2" Figma frame: slate case, a terracotta
// Claude card with a cream body, and a grey-slate card for you.

// The name on your card: the `name` option you set when installing the mod (or
// later in /config), in capitals; `YOU` until one is set.
const nameFrom = (options: Readonly<Record<string, unknown>>) => {
  const raw = typeof options.name === 'string' ? options.name.trim() : ''

  return (raw === '' ? 'YOU' : raw).toUpperCase().slice(0, 16)
}
const escapeXml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const { theme, problems } = makeColors({
  label: 'CalcJump',
  only: 'dark',
  roles: {
    accent: '#ca7c5f',
    danger: '#d2644e',
    success: '#a3d37e',
    warning: '#dcc877',
    pro: '#aca1db',
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#25282e',
        'surface-1': '#292c32',
        'surface-2': '#2c3036',
        'surface-3': '#2c3036',
        'text-primary': '#ecebe6',
        'text-secondary': '#cdcabf',
        'text-muted': '#a3a094',
      },
    },
  },
})

const LOOK: ThemeSetArgs = {
  colors: theme,
  // The Figma "Background Layer", redrawn crisp: see SCENE. The app's panels
  // (the footer behind the message box among them) go fully clear with no blur,
  // so the dither runs all the way down behind them. `glass: false` instead
  // keeps them opaque, which hid the bottom of the dither.
  backdrop: { scene: 'calcjump-bg', glass: { blur: 0, opacity: 0 } },
}

// ---- Background Layer -----------------------------------------------------------
// Read off the frame's export: #25282e above, then a Bayer 4 x 4 ordered dither of
// 4.5px square pixels in #2e3238 that thickens from y 524 to y 842, then solid
// #2e3238. Pinned to the bottom of the window (xMidYMax slice), so the band
// always comes up from the bottom, at any window size.
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]
const PX = 4.5
const BAND_TOP = 524
const BAND_ROWS = 71
const levelPattern = (level: number) => {
  const cells: string[] = []

  for (let k = 0; k < 4; k += 1) {
    for (let i = 0; i < 4; i += 1) {
      if (((BAYER[k] as number[])[i] as number) < level) {
        cells.push(`<rect x="${i * PX}" y="${k * PX}" width="${PX}" height="${PX}"/>`)
      }
    }
  }

  return `<pattern id="d${level}" x="0" y="${BAND_TOP}" width="${PX * 4}" height="${PX * 4}" patternUnits="userSpaceOnUse">${cells.join('')}</pattern>`
}
const BAND = Array.from({ length: BAND_ROWS }, (_, j) => {
  const level = Math.min(16, Math.round((16 * (j + 1)) / BAND_ROWS))

  return `<rect y="${BAND_TOP + j * PX}" width="1400" height="${PX}" fill="url(#d${level})"/>`
}).join('')
const SCENE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 900" preserveAspectRatio="xMidYMax slice" shape-rendering="crispEdges">
  <defs><g fill="#2e3238">${Array.from({ length: 17 }, (_, l) => levelPattern(l)).join('')}</g></defs>
  <rect x="-2000" y="-2000" width="5400" height="2900" fill="#25282e"/>
  <g fill="#2e3238">${BAND}</g>
  <rect x="-2000" y="${BAND_TOP + BAND_ROWS * PX}" width="5400" height="2000" fill="#2e3238"/>
</svg>`

// Rounded card corners: Ink's `round` border, in the card's own color, with the
// header clipped to it. `overflow` can't hold the app's own row (an image
// message), so `cardOpen` leaves it out for those.
const card = { borderStyle: 'round', overflow: 'hidden' as const }
const cardOpen = { borderStyle: 'round' }

// ---- Card art, traced from the frame ------------------------------------------
// The mascot, on its own 39 x 24 pixel grid, read off the frame's pixels.
const MASCOT = `
<g shape-rendering="crispEdges">
  <g fill="#e1c3b8">
    <rect x="5" y="0" width="28" height="19"/>
    <rect x="0" y="9" width="39" height="5"/>
    <rect x="7" y="19" width="3" height="5"/>
    <rect x="12" y="19" width="3" height="5"/>
    <rect x="24" y="19" width="3" height="5"/>
    <rect x="29" y="19" width="3" height="5"/>
  </g>
  <g fill="#1c1917">
    <rect x="9.5" y="4.5" width="2.5" height="5"/>
    <rect x="26.5" y="4.5" width="2.5" height="5"/>
  </g>
</g>`

// Your sunburst from the Figma file (node 72:1224, strokes outlined): twelve
// bars through the centre of a 30 x 30 box, so it lines up with the name.
const SUN_GOLD = '#dcc877'
const SUN_PATHS = [
  'M15.417 0V30H14.583V0H15.417Z',
  'M30 14.583V15.417H0V14.583H30Z',
  'M25.9013 4.68844L4.68841 25.9013L4.09857 25.3115L25.3115 4.09859L25.9013 4.68844Z',
  'M25.9013 25.3115L25.3115 25.9013L4.09857 4.68844L4.68841 4.09859L25.9013 25.3115Z',
  'M22.8613 27.7827L22.1387 28.1987L7.13867 2.21725L7.86133 1.80123L22.8613 27.7827Z',
  'M28.1987 7.86133L2.21726 22.8613L1.80124 22.1387L27.7827 7.13867L28.1987 7.86133Z',
  'M19.284 0.618184L11.5204 29.5967L10.7157 29.3819L18.4793 0.403341L19.284 0.618184Z',
  'M29.5967 18.4793L29.3819 19.284L0.403341 11.5204L0.618184 10.7157L29.5967 18.4793Z',
  'M28.1987 22.1387L27.7827 22.8613L1.80124 7.86133L2.21726 7.13867L28.1987 22.1387Z',
  'M22.8613 2.21725L7.86133 28.1987L7.13867 27.7827L22.1387 1.80123L22.8613 2.21725Z',
  'M19.284 29.3819L18.4793 29.5967L10.7157 0.618184L11.5204 0.403341L19.284 29.3819Z',
  'M29.5967 11.5204L0.618184 19.284L0.403341 18.4793L29.3819 10.7157L29.5967 11.5204Z',
]
const SUN = `<g fill="${SUN_GOLD}">${SUN_PATHS.map(d => `<path d="${d}"/>`).join('')}</g>`

// A label whose capitals sit centred on `mid`: 12px caps are about 8.6 tall.
const label = (text: string, fill: string, mid: number, x = 49) =>
  `<text x="${x}" y="${(mid + 4.3).toFixed(1)}" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" letter-spacing="2.6" fill="${fill}">${text}</text>`

// The headers are 57px tall in the frame, so each header's art is a 57px-tall
// strip with its icon and label centred on the strip's middle line.
const HEAD_H = 57
const MID = HEAD_H / 2
const HEAD_CLAUDE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 ${HEAD_H}" width="160" height="${HEAD_H}"><g transform="translate(0 ${MID - 12})">${MASCOT}</g>${label('CLAUDE', '#2e2420', MID)}</svg>`
// Your header, sized to your name: about 11px a capital at this size and spacing.
const headUser = (name: string) => {
  const width = Math.max(160, 40 + name.length * 11 + 12)

  return {
    width,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${HEAD_H}" width="${width}" height="${HEAD_H}"><g transform="translate(0 ${MID - 15})">${SUN}</g>${label(escapeXml(name), SUN_GOLD, MID, 40)}</svg>`,
  }
}

// ---- A small markdown renderer, so the cream body can keep dark ink ------------
const INK = '#2b2724'
type Parts = { Text: any; Box: any; Code: any }

const inline = ({ Text }: Parts, text: string, color: string) =>
  text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <Text key={i} weight="bold" color={color}>
          {part.slice(2, -2)}
        </Text>
      )
    }

    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <Text key={i} mono color={color} backgroundColor="#ddd3c8">
          {part.slice(1, -1)}
        </Text>
      )
    }

    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <Text key={i} italic color={color}>
          {part.slice(1, -1)}
        </Text>
      )
    }

    return (
      <Text key={i} color={color}>
        {part}
      </Text>
    )
  })

const blocks = (parts: Parts, source: string) => {
  const { Text, Box, Code } = parts
  const out: RenderChildren[] = []
  const lines = source.split('\n')
  let paragraph: string[] = []
  let n = 0

  const flush = () => {
    if (paragraph.length > 0) {
      out.push(
        <Box key={n++} marginTop={out.length > 0 ? 1 : 0}>
          <Text>{inline(parts, paragraph.join(' '), INK)}</Text>
        </Box>,
      )
      paragraph = []
    }
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] as string
    const fence = line.match(/^\s*```(\w*)/)

    if (fence !== null) {
      flush()
      const body: string[] = []

      i += 1
      while (i < lines.length && !(lines[i] as string).trim().startsWith('```')) {
        body.push(lines[i] as string)
        i += 1
      }
      out.push(
        <Box key={n++} marginTop={1} backgroundColor="#2b2e35" paddingX={1}>
          <Code source={body.join('\n')} language={fence[1] || undefined} />
        </Box>,
      )
      continue
    }

    const bullet = line.match(/^(\s*)([-*])\s+(.*)$/)
    const numbered = line.match(/^(\s*)(\d+)\.\s+(.*)$/)
    const heading = line.match(/^#{1,6}\s+(.*)$/)

    if (line.trim() === '') {
      flush()
    } else if (bullet !== null || numbered !== null) {
      flush()
      const m = (bullet ?? numbered) as RegExpMatchArray
      const mark = bullet !== null ? '•' : `${m[2]}.`

      out.push(
        <Box key={n++} paddingLeft={Math.floor((m[1] as string).length / 2) + 1}>
          <Text color={INK}>{mark} </Text>
          <Text>{inline(parts, m[3] as string, INK)}</Text>
        </Box>,
      )
    } else if (heading !== null) {
      flush()
      out.push(
        <Box key={n++} marginTop={out.length > 0 ? 1 : 0}>
          <Text weight="bold" color={INK}>
            {heading[1]}
          </Text>
        </Box>,
      )
    } else if (line.trim().startsWith('|')) {
      flush()
      out.push(
        <Text key={n++} mono color={INK}>
          {line}
        </Text>,
      )
    } else {
      paragraph.push(line.trim())
    }
  }
  flush()

  return out
}

export const register: Register = (on, options) => {
  const userName = nameFrom(options)
  const userHead = headUser(userName)

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

  // Draws the Background Layer the theme names (`backdrop.scene`): a scene with
  // no hook here draws nothing, silently.
  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== 'calcjump-bg') {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)

    return <Svg source={SCENE} alt="Slate with a pixel dither rising from the bottom" isInteractive />
  })

  // You: a grey-slate card, sunburst and your name in yellow. Every message of
  // yours, whichever app sent it (Desktop's arrive as its own, not the
  // terminal's); only background-task notices and other agents' messages pass.
  // Notes a prompt sent with an attachment. A failed note never holds up the
  // prompt: it's caught, and the prompt goes on as sent.
  on('prompt.submit', async ($, e, next) => {
    if (e.attachments !== undefined && e.attachments.length > 0) {
      const text = e.text

      await update($, withMedia, list => [...list.filter(one => one !== text), text].slice(-100)).catch(() => undefined)
    }

    return next(e)
  })

  on('ui.render', { component: 'UserMessage' }, async ($, e, next) => {
    const isOthers = e.props.task !== undefined || e.props.from !== undefined || e.props.origin.kind === 'task-notification'

    if (e.surface !== 'desktop' || isOthers) {
      return next(e)
    }

    const { Box, Text, Svg } = $.ui.resolve(e)
    // With an attachment, the body is the app's own row, which draws the image.
    const hasMedia = (await read($, withMedia)).includes(e.props.text)
    const body = hasMedia ? await next(e) : <Text color="#efede8">{e.props.text}</Text>

    return frame({ Box, Svg }, {
      frameColor: '#3b3e45',
      bodyColor: '#50545d',
      head: userHead.svg,
      headWidth: userHead.width,
      headAlt: `${userName}, with a sunburst`,
      isOpen: hasMedia,
      body,
    })
  })

  // Claude: a terracotta header with the mascot, over a cream body, on every
  // block of a reply (a reply split by tool calls is several blocks).
  on('ui.render', { component: 'AssistantMessage' }, ($, e, next) => {
    if (e.surface !== 'desktop' || e.props.isSummary === true) {
      return next(e)
    }

    const { Box, Text, Svg, Code } = $.ui.resolve(e)

    return frame({ Box, Svg }, {
      frameColor: '#ca7c5f',
      bodyColor: '#ede6de',
      head: HEAD_CLAUDE,
      headAlt: 'Claude, the pixel mascot',
      isOpen: false,
      body: blocks({ Text, Box, Code }, e.props.text),
    })
  })
}

// One card, as in the frame: an outer rounded card in the header's color, the
// 57px header across its top, and the body inset 8px on the sides and bottom with
// its own rounded corners. The outer border takes a cell of its own, which the
// header and body win back with one-cell negative margins.
function frame(
  { Box, Svg }: { Box: any; Svg: any },
  opts: { frameColor: string; bodyColor: string; head: string; headWidth?: number; headAlt: string; isOpen: boolean; body: RenderChildren },
) {
  const outer = opts.isOpen ? cardOpen : card

  return (
    <Box {...outer} borderColor={opts.frameColor} flexDirection="column" marginY={1} backgroundColor={opts.frameColor}>
      <Box backgroundColor={opts.frameColor} flexDirection="row" alignItems="center" marginTop={-1} marginX={-1}>
        <Box paddingLeft={1}>
          <Svg source={opts.head} alt={opts.headAlt} width={opts.headWidth ?? 160} height={HEAD_H} />
        </Box>
      </Box>
      <Box marginX={-1}>
        <Box flexDirection="column" flexGrow={1} borderStyle="round" borderColor={opts.bodyColor} backgroundColor={opts.bodyColor} paddingX={2}>
          {opts.body}
        </Box>
      </Box>
    </Box>
  )
}
