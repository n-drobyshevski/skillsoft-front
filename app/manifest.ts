import { MetadataRoute } from 'next';

/**
 * PWA Web App Manifest
 *
 * Defines how the app appears when installed on a device:
 * - App name and description
 * - Theme and background colors
 * - Icon set for various device sizes
 * - Display mode and orientation
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/Manifest
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SkillSoft - Competency Management',
    short_name: 'SkillSoft',
    description: 'A platform for managing skills, competencies, and psychometric assessments',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f172a', // slate-900
    orientation: 'any',
    categories: ['business', 'education', 'productivity'],
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    screenshots: [],
    shortcuts: [
      {
        name: 'Psychometrics Dashboard',
        short_name: 'Psychometrics',
        url: '/psychometrics',
        description: 'View psychometric analysis and item quality metrics',
      },
      {
        name: 'Test Templates',
        short_name: 'Templates',
        url: '/test-templates',
        description: 'Manage assessment test templates',
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}
