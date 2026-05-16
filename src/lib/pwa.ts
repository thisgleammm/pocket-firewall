export function shouldShowInstallPrompt({
  dismissed,
  hasPrompt,
  installed,
  standalone,
}: {
  dismissed: boolean
  hasPrompt: boolean
  installed: boolean
  standalone: boolean
}) {
  return hasPrompt && !dismissed && !installed && !standalone
}
