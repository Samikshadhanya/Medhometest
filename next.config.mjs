const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    unoptimized: true,
  },

  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
}

export default nextConfig