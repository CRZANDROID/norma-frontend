import { BorderBeam, type BorderBeamProps } from 'border-beam'
import { useReducedMotion } from 'motion/react'

/**
 * Border beam tuned for NORMA surfaces (light, ocean ≈ accent purple).
 * Rotate types do not pause on their own; we gate `active` with reduced motion.
 */
export function NormaBorderBeam({
  children,
  active = true,
  theme = 'light',
  colorVariant = 'ocean',
  size = 'md',
  strength = 1,
  ...props
}: BorderBeamProps) {
  const reduceMotion = useReducedMotion()

  return (
    <BorderBeam
      {...props}
      size={size}
      colorVariant={colorVariant}
      theme={theme}
      strength={strength}
      active={active && !reduceMotion}
    >
      {children}
    </BorderBeam>
  )
}
