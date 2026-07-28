/** Focus the first invalid control after a failed native check. */
export function focusFirstInvalid(form: HTMLFormElement) {
  const el = form.querySelector<HTMLElement>(':invalid')
  el?.focus()
}
