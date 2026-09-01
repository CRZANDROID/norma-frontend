import type { FindingImpact } from '@/features/findings/types/finding'

export const IMPACT_LAMP: Record<
  FindingImpact,
  { fill: string; glow: string; ring: string; text: string; wash: string }
> = {
  GREEN: {
    fill: 'bg-norma-green',
    glow: 'shadow-[0_0_16px_rgba(26,148,92,0.4)]',
    ring: 'ring-norma-green/45',
    text: 'text-norma-green',
    wash: 'bg-norma-green/12',
  },
  YELLOW: {
    fill: 'bg-norma-amber',
    glow: 'shadow-[0_0_16px_rgba(184,134,31,0.35)]',
    ring: 'ring-norma-amber/45',
    text: 'text-norma-amber',
    wash: 'bg-norma-amber/12',
  },
  ORANGE: {
    fill: 'bg-norma-coral',
    glow: 'shadow-[0_0_16px_rgba(217,107,72,0.35)]',
    ring: 'ring-norma-coral/45',
    text: 'text-norma-coral',
    wash: 'bg-norma-coral/12',
  },
  RED: {
    fill: 'bg-norma-red',
    glow: 'shadow-[0_0_18px_rgba(201,63,70,0.45)]',
    ring: 'ring-norma-red/50',
    text: 'text-norma-red',
    wash: 'bg-norma-red/12',
  },
}
