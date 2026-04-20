/**
 * Application Entry Point
 * This file initializes the React application by mounting the root component
 * into the DOM element defined in index.html.
 */
/// <reference types="vite/client" />
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css"; // Global styles and Tailwind CSS injections

/**
 * Root Initialization:
 * 1. Finds the HTML element with id 'root'.
 * 2. The '!' operator asserts that the element exists and is not null.
 * 3. createRoot manages the rendering lifecycle of the application.
 */
const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    /**
     * Renders the main App component. 
     * All sub-pages and logic start from within the <App /> component.
     */
    <App />
  );
}