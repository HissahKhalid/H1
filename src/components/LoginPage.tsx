/**
 * LoginPage Component
 * The entry point for the Halm Safety System. 
 * This component manages:
 * 1. User Authentication (Login)
 * 2. User Registration (Signup)
 * 3. Password Reset Flow (Dialog)
 * 4. Technical Support & Help Resources (Dialog)
 */

import { useState } from 'react';
import { Shield, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2, Mail, HelpCircle, Send, Phone, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
// @ts-ignore
import halmLogo from '../assets/logo.png';

// Backend API Configuration
const API_URL = 'https://Halm.pythonanywhere.com';

interface LoginPageProps {
  onLogin: () => void; // Callback to trigger successful session transition
}

export function LoginPage({ onLogin }: LoginPageProps) {
  /**
   * Mode State: 
   * Toggles between Login and Registration forms.
   */
  const [isRegistering, setIsRegistering] = useState(false);

  /**
   * Form Input States:
   * Collected and sent to the Flask backend for verification.
   */
  const [username, setUsername] = useState(''); 
  const [email, setEmail] = useState('');      
  const [password, setPassword] = useState(''); 
  
  // UI Utility States
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Modal Visibility States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  /**
   * handleSubmit:
   * Manages the submission logic for both Login and Registration.
   * Dynamically switches endpoints based on 'isRegistering'.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
        const endpoint = isRegistering ? '/api/register' : '/api/login';
        const payload = isRegistering 
            ? { username, email, password } 
            : { email, password };

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            if (isRegistering) {
                // Handle Registration Success: Switch user to login mode
                setSuccessMessage("Account created successfully! Please log in.");
                setIsRegistering(false); 
                setPassword(''); 
            } else {
                // Handle Login Success: Persist session locally
                localStorage.setItem('officerName', data.username || 'Safety Officer');
                localStorage.setItem('officerEmail', email);
                onLogin(); // Navigate to Dashboard
            }
        } else {
            // Handle Backend Validation Errors (e.g., Wrong password, User exists)
            setErrorMessage(data.message || "Authentication failed. Please verify credentials.");
        }
    } catch (error) {
        setErrorMessage("Network Failure: Backend server is unreachable.");
    } finally {
        setIsLoading(false);
    }
  };

  /**
   * handlePasswordReset:
   * Simulated password recovery logic. 
   * Provides UI feedback for the email recovery process.
   */
  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    // Simulation: Typically connects to /api/reset-password
    setTimeout(() => {
      setIsResetting(false);
      setResetSent(true);
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetSent(false);
        setResetEmail('');
      }, 3000);
    }, 1500);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-slate-900 to-purple-800 p-4">
      
      {/* Visual Layer: Animated Blobs for high-end UI feel */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-purple-600/10 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Branding Section: Halm Logo and Title */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-white p-3 shadow-2xl shadow-purple-500/50"
          >
            <img src={halmLogo} alt="Halm Identity" className="h-full w-full object-contain" />
          </motion.div>
          <motion.h1 className="mb-2 text-white">Halm System</motion.h1>
        </div>

        {/* Main Authentication Card */}
        <motion.div
          layout
          className="rounded-3xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-6">
            <h2 className="mb-1 text-xl font-bold text-slate-900">
                {isRegistering ? "Create Account" : "Officer Authentication"}
            </h2>
            <p className="text-sm text-slate-600">
                {isRegistering ? "Register your safety officer credentials" : "Secure access to monitoring dashboard"}
            </p>
          </div>

          {/* Alert Callouts for Error/Success */}
          {errorMessage && (
            <motion.div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" /> {errorMessage}
            </motion.div>
          )}
          {successMessage && (
            <motion.div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" /> {successMessage}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Conditional Registration Field: Full Name */}
            <AnimatePresence>
                {isRegistering && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <label className="mb-2 block text-sm text-slate-700">Full Name</label>
                        <div className="group relative mb-5">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <User className="h-5 w-5 text-slate-400 group-focus-within:text-purple-600" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-12 transition-all focus:border-purple-500"
                                placeholder="e.g. Abdullah Salem"
                                required={isRegistering}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Email Identification */}
            <div>
              <label className="mb-2 block text-sm text-slate-700">Email Address</label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-purple-600" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-12 transition-all focus:border-purple-500"
                  placeholder="officer@kfu.edu.sa"
                  required
                />
              </div>
            </div>

            {/* Password Security */}
            <div>
              <label className="mb-2 block text-sm text-slate-700">Password</label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-purple-600" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-12 transition-all focus:border-purple-500"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Action: Login or Sign Up */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-4 text-white shadow-lg transition-all"
            >
              {isLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-5 w-5 rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <><Lock className="h-5 w-5" /> <span>{isRegistering ? "Register Account" : "Secure Login"}</span></>
              )}
            </motion.button>
          </form>

          {/* Navigation Links: Toggle and Recovery */}
          <div className="mt-6 flex flex-col items-center gap-3 text-sm">
             <div className="text-slate-600">
                {isRegistering ? "Existing officer?" : "New to the system?"}{" "}
                <button onClick={() => { setIsRegistering(!isRegistering); setErrorMessage(''); }} className="font-bold text-purple-600 hover:underline">
                    {isRegistering ? "Login here" : "Sign up"}
                </button>
             </div>
             {!isRegistering && (
                <div className="flex gap-4">
                    <button onClick={() => setShowForgotPassword(true)} className="text-slate-500 hover:text-purple-600">Forgot password?</button>
                    <span className="text-slate-300">|</span>
                    <button onClick={() => setShowHelp(true)} className="text-slate-500 hover:text-purple-600">Get Help</button>
                </div>
             )}
          </div>
        </motion.div>

        {/* System Credits and Protection Badge */}
        <motion.div transition={{ delay: 1 }} className="mt-6 text-center">
          <p className="mb-2 text-xs text-slate-400">© 2026 Halm Safety System</p>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <Shield className="h-3 w-3" /> Encrypted Safety Data Transmission Active
          </div>
        </motion.div>
      </motion.div>

      {/* 1. Recover Password Modal (Dialog) */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Account Recovery</DialogTitle>
            <DialogDescription className="text-slate-500">
              Enter your registered email address and we'll send you instructions to reset your password.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {resetSent ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center gap-3 rounded-xl border border-green-100 bg-green-50 p-6 text-center text-green-700"
              >
                <CheckCircle2 className="h-10 w-10 text-green-500" />
                <p className="font-medium">Recovery email sent!</p>
                <p className="text-sm">Please check your inbox (and spam folder) for the reset link.</p>
              </motion.div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-purple-600" />
                  </div>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="block w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3 pl-12 transition-all focus:border-purple-500"
                    placeholder="officer@kfu.edu.sa"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isResetting || !resetEmail}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-white shadow-md transition-all hover:bg-purple-700 disabled:opacity-70"
                >
                  {isResetting ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-5 w-5 rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <><Send className="h-4 w-4" /> <span>Send Recovery Link</span></>
                  )}
                </button>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. Technical Support / Help Modal (Dialog) */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <HelpCircle className="h-5 w-5 text-purple-600" /> Need Assistance?
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              If you are experiencing issues accessing the Halm Safety System, please reach out to the IT Helpdesk.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 flex flex-col gap-3">
            <a href="mailto:support@halmsystem.com" className="flex items-center gap-4 rounded-xl border-2 border-slate-100 p-4 transition-colors hover:border-purple-200 hover:bg-purple-50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Email Support</p>
                <p className="text-sm text-slate-500">IT.support@halmsystem.com</p>
              </div>
            </a>

            <div className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-slate-100 p-4 transition-colors hover:border-purple-200 hover:bg-purple-50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Emergency Contact</p>
                <p className="text-sm text-slate-500">+966 50 000 0000</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowHelp(false)}
              className="mt-2 w-full rounded-xl bg-slate-100 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
