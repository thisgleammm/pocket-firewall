declare module "next-pwa" {
  import type { NextConfig } from "next"

  type WithPWAFactory = (
    options?: Record<string, unknown>
  ) => (config: NextConfig) => NextConfig

  const withPWA: WithPWAFactory

  export default withPWA
}
