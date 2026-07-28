import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import * as React from 'react'
import {
  chevronSpring,
  selectPanel,
  selectPanelReduced,
} from '@/shared/lib/motion'
import { cn } from '@/shared/lib/utils'

export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export type SelectProps = {
  id?: string
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  required?: boolean
  name?: string
  className?: string
  'aria-label'?: string
}

export function Select({
  id,
  value,
  onValueChange,
  options,
  placeholder = 'Seleccionar…',
  disabled,
  required,
  name,
  className,
  'aria-label': ariaLabel,
}: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const reduceMotion = useReducedMotion()
  const panel = reduceMotion ? selectPanelReduced : selectPanel
  // Items unmount while closed; pass label so SelectValue isn't blank.
  const selectedLabel = options.find((option) => option.value === value)?.label

  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      open={open}
      onOpenChange={setOpen}
      disabled={disabled}
      required={required}
      name={name}
    >
      <SelectPrimitive.Trigger
        id={id}
        aria-label={ariaLabel}
        className={cn(
          'group flex h-10 w-full items-center justify-between gap-2 rounded-2xl border-2 border-norma-border bg-norma-raised px-3 text-left text-sm text-norma-fg outline-none',
          'transition-[transform,box-shadow,border-color,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]',
          'hover:bg-norma-surface',
          'focus-visible:border-norma-accent focus-visible:ring-2 focus-visible:ring-norma-accent/25',
          'data-[state=open]:border-norma-accent data-[state=open]:bg-norma-surface data-[state=open]:ring-2 data-[state=open]:ring-norma-accent/25',
          'active:scale-[0.99]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          '[&[data-placeholder]]:text-norma-subtle',
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder}>
          {selectedLabel}
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon asChild>
          <motion.span
            className="inline-flex shrink-0 text-norma-subtle transition-colors duration-150 group-data-[state=open]:text-norma-accent"
            animate={{ rotate: open ? 180 : 0 }}
            transition={reduceMotion ? { duration: 0 } : chevronSpring}
            aria-hidden
          >
            <ChevronDown className="size-4" />
          </motion.span>
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <AnimatePresence>
        {open ? (
          <SelectPrimitive.Portal forceMount>
            <SelectPrimitive.Content
              forceMount
              position="popper"
              sideOffset={6}
              collisionPadding={8}
              className="z-[60] min-w-[var(--radix-select-trigger-width)] outline-none"
            >
              <motion.div
                variants={panel}
                initial="initial"
                animate="animate"
                exit="exit"
                className="origin-top overflow-hidden rounded-2xl border-2 border-norma-border bg-norma-surface/95 p-1 shadow-[0_16px_40px_-16px_rgba(13,27,42,0.4)] backdrop-blur-md"
              >
                <SelectPrimitive.Viewport className="flex flex-col gap-0.5 p-0.5">
                  {options.map((option) => (
                    <SelectPrimitive.Item
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      className={cn(
                        'relative flex cursor-pointer select-none items-center rounded-xl py-2 pl-3 pr-9 text-sm text-norma-fg outline-none',
                        'transition-colors duration-100 ease-[cubic-bezier(0.23,1,0.32,1)]',
                        'data-[highlighted]:bg-norma-accent/10 data-[highlighted]:text-norma-fg',
                        'data-[state=checked]:font-medium data-[state=checked]:text-norma-accent',
                        'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
                      )}
                    >
                      <SelectPrimitive.ItemText>
                        {option.label}
                      </SelectPrimitive.ItemText>
                      <SelectPrimitive.ItemIndicator className="absolute right-2.5 inline-flex text-norma-accent">
                        <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
                      </SelectPrimitive.ItemIndicator>
                    </SelectPrimitive.Item>
                  ))}
                </SelectPrimitive.Viewport>
              </motion.div>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </SelectPrimitive.Root>
  )
}
