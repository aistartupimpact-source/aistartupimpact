import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Udyaibase',
    short_name: 'Udyaibase',
    description: 'Premier platform for Indian AI news. Discover top AI startups, funding, tools, and founder stories.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#6366f1',
    icons: [
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
