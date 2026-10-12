/** Curvas y timings — filosofía Emil Kowalski / animations.dev */
export const easeOut = [0.23, 1, 0.32, 1] as const
export const easeInOut = [0.77, 0, 0.175, 1] as const
export const easeDrawer = [0.32, 0.72, 0, 1] as const

export const duration = {
  press: 0.12,
  fast: 0.16,
  ui: 0.2,
  modal: 0.28,
  page: 0.24,
  tab: 0.22,
} as const

export const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
}

export const fadeScale = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
}

/** Transición entre secciones del shell (Alertas / Clientes / Fuentes…) */
export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
}

/** Contenido de tabs Datos ↔ Perfiles */
export const tabPanel = {
  initial: { opacity: 0, x: 14 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
}

/** Soft swap inside a stable master-detail shell (opacity only — no y jump) */
export const detailCrossfade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

/**
 * Panel de Select / dropdown (Emil: 150–250ms, scale ≥0.95, exit más rápido).
 * Solo opacity + transform; el positioning lo deja Radix en el Content externo.
 */
export const selectPanel = {
  initial: { opacity: 0, y: -4, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: duration.ui, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: -2,
    scale: 0.98,
    transition: { duration: duration.fast, ease: easeOut },
  },
}

export const selectPanelReduced = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: duration.fast, ease: easeOut },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast, ease: easeOut },
  },
}

/** Chevron del Select — spring suave, bounce bajo */
export const chevronSpring = {
  type: 'spring' as const,
  duration: 0.35,
  bounce: 0.18,
}

export function sectionKeyFromPath(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean)[0]
  return segment ?? 'dashboard'
}

/** Brand mark — mount entrance (opacity + transform only) */
export const brandMarkEnter = {
  initial: { opacity: 0, scale: 0.94 },
  animate: { opacity: 1, scale: 1 },
}

/**
 * Brand mark — gentle idle presence on the focal node.
 * Soft spring loop; skip entirely when prefers-reduced-motion.
 */
export const brandMarkIdle = {
  animate: { opacity: [0.55, 1, 0.55], scale: [0.92, 1, 0.92] },
  transition: {
    duration: 3.2,
    ease: easeInOut,
    repeat: Infinity,
    repeatType: 'loop' as const,
  },
}
