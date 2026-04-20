/// <reference types="vite/client" />

/**
 * Halm Safety System - Environment Definitions
 * This file links the project to Vite's built-in type definitions.
 * Vite automatically handles types for .png, .jpg, .svg, and .css files,
 * so manual declarations are not required and would cause duplicate errors.
 */

/// <reference types="vite/client" /> 

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}