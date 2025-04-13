"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Email, EyeIcon, EyeSlashIcon, Lock } from "@/assets/icons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  useEffect(() => {
    localStorage.clear();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 relative overflow-hidden w-full">
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-indigo-600 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-600 rounded-full blur-3xl transform translate-x-1/3 translate-y-1/3"></div>
        <svg
          className="absolute top-0 left-0 w-full h-full opacity-30"
          viewBox="0 0 200 200"
          fill="none"
        >
          <path
            d="M44.3,-76.2C59.2,-69.5,74.5,-60.5,83.1,-46.7C91.8,-32.9,93.9,-14.3,90.1,2.2C86.2,18.7,76.4,33.1,65.4,44.7C54.3,56.3,42,65,28.1,72.8C14.1,80.5,-1.5,87.3,-17.4,85.7C-33.3,84.2,-49.4,74.4,-60.2,61.3C-71,48.3,-76.5,32,-79.6,15.1C-82.7,-1.9,-83.3,-19.5,-76.5,-32.8C-69.7,-46.1,-55.4,-55.1,-41.3,-62.2C-27.2,-69.4,-13.6,-74.7,1.1,-76.5C15.8,-78.4,29.5,-82.9,44.3,-76.2Z"
            fill="#4F46E5"
            transform="translate(100 100)"
          />
        </svg>
      </div>

      {/* Login Card */}
      <div className="relative z-10 bg-gray-800/90 p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Admin Login
          </h1>
          <p className="text-gray-400">
            Enter your credentials to access the dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/20 text-red-200 rounded-lg flex items-center gap-3 border border-red-500/30 animate-pulse">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="group">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-indigo-400 transition-colors"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Email />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div className="group">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-indigo-400 transition-colors"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-200 transition-colors"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-800 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
