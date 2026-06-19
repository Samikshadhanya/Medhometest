const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

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

  // Dynamic basePath: Use repository name on GitHub Pages, empty elsewhere
  basePath: isGithubActions ? '/Medhometest' : '',
}

export default nextConfig