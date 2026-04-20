/**
 * Main Application Component
 * This component serves as the primary router and state manager for the Halm System.
 * It handles user authentication and conditional rendering of top-level pages.
 */

import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { ReportsPage } from './components/ReportsPage';
import { SettingsPage } from './components/SettingsPage';
import { WorkersPage } from './components/WorkersPage'; 
import { Page } from './types'; 

export default function App() {
  /**
   * Application State:
   * currentPage: Tracks the active view using the unified 'Page' type.
   * isAuthenticated: Manages the global login status of the user.
   */
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * handleLogin:
   * Updates authentication state and redirects the user to the main dashboard.
   */
  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  /**
   * handleLogout:
   * Clears local session data and resets the application to the initial state.
   */
  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setCurrentPage('dashboard'); 
  };

  /**
   * navigateTo:
   * A unified navigation handler passed to child components to trigger page changes.
   * @param page - The destination page identifier defined in Page types.
   */
  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  /**
   * Authentication Guard:
   * Prevents unauthenticated users from accessing internal system views.
   * If not logged in, the system forces the LoginPage to be rendered.
   */
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50">
      
      {/* Conditional Rendering Logic (Routing):
        Displays the component corresponding to the current state of 'currentPage'.
      */}
      
      {currentPage === 'dashboard' && (
        <Dashboard onNavigate={navigateTo} onLogout={handleLogout} />
      )}

      {currentPage === 'reports' && (
        <ReportsPage onNavigate={navigateTo} onLogout={handleLogout} />
      )}

      {/* Workers Management Routing:
        Provides access to the worker database and helmet tracking interface.
      */}
      {currentPage === 'workers' && (
        <WorkersPage onNavigate={navigateTo} onLogout={handleLogout} />
      )}

      {currentPage === 'settings' && (
        <SettingsPage onNavigate={navigateTo} onLogout={handleLogout} />
      )}
    </div>
  );
}