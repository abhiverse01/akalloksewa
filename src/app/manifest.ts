import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AkalLoksewa',
    short_name: 'AkalLoksewa',
    description: "Nepal's most powerful Loksewa preparation platform",
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#08091a',
    theme_color: '#08091a',
    orientation: 'portrait',
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
    categories: ['education'],
    lang: 'ne-NP',
    dir: 'ltr',
  }
}
