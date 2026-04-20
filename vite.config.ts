/**
 * Vite Configuration File
 * This file defines the environment and build settings for the Halm protection system project.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  /**
   * plugins: Integrates the React Refresh plugin using the SWC compiler 
   * for significantly faster development builds.
   */
  plugins: [react()],
  
  resolve: {
    /**
     * extensions: Automatically resolves these file extensions during imports.
     * This allows importing components without explicitly stating the file type.
     */
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    
    /**
     * alias: Defines path shortcuts to map complex import strings to local packages.
     * This section ensures that specific versioned imports used in the project 
     * are correctly resolved to the installed dependencies.
     */
    alias: {
      'vaul@1.1.2': 'vaul',
      'sonner@2.0.3': 'sonner',
      'recharts@2.15.2': 'recharts',
      'react-resizable-panels@2.1.7': 'react-resizable-panels',
      'react-hook-form@7.55.0': 'react-hook-form',
      'react-day-picker@8.10.1': 'react-day-picker',
      'next-themes@0.4.6': 'next-themes',
      'lucide-react@0.487.0': 'lucide-react',
      'input-otp@1.4.2': 'input-otp',
      
      /**
       * Asset Alias: Maps a Figma-generated asset path to the local project assets folder.
       */
      'figma:asset/cdd72cd7c919b6dd22d6bfc3bfac835c06cd3ce1.png': path.resolve(__dirname, './src/assets/cdd72cd7c919b6dd22d6bfc3bfac835c06cd3ce1.png'),
      
      'embla-carousel-react@8.6.0': 'embla-carousel-react',
      'cmdk@1.1.1': 'cmdk',
      'class-variance-authority@0.7.1': 'class-variance-authority',
      
      /**
       * Radix UI Component Aliases:
       * Maps specific versioned Radix UI primitive imports to their respective installed packages.
       */
      '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
      '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
      '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
      '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
      '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
      '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
      '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
      '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
      '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
      '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
      '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
      '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
      '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
      '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
      '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
      '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
      '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
      '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
      '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
      '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
      '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
      '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
      '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
      '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
      
      /**
       * Core Shortcut:
       * The '@' symbol is mapped to the 'src' folder for cleaner import statements throughout the app.
       */
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  build: {
    /**
     * target: 'esnext' optimizes the final bundle for modern browsers 
     * supporting the latest JavaScript features.
     */
    target: 'esnext',
    
    /**
     * outDir: The destination directory for the compiled production files.
     */
    outDir: 'build',
  },
  
  server: {
    /**
     * port: Specifies the local development server port.
     */
    port: 3000,
    
    /**
     * open: Automatically launches the application in the default browser on startup.
     */
    open: true,
  },
});