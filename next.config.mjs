const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    unoptimized: true,
  },

  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },

  // Required for Capacitor - static export
  output: 'export',

  // Disable trailing slash for better Capacitor routing
  trailingSlash: false,

  // Ensure all routes are statically generated
  distDir: 'out',
}

export default nextConfig