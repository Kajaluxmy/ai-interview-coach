import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BrainCircuit,
  LayoutDashboard,
  FileText,
  Briefcase,
  PlayCircle,
  BarChart3,
  Menu,
  X,
  LogOut,
  User,
  Zap,
} from "lucide-react";

export default function Navbar({ user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Mock Interviews", path: "/interviews", icon: PlayCircle },
    { name: "Question Drills", path: "/drill", icon: Zap },
    { name: "Resumes", path: "/resumes", icon: FileText },
    { name: "Job Matcher", path: "/jobs", icon: Briefcase },
    { name: "Reports", path: "/reports", icon: BarChart3 },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
                AI Coach
              </span>
              <span className="block text-[10px] text-teal-400 font-medium tracking-widest uppercase">
                Interview Prep
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {user ? (
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          ) : null}

          {/* Right Action Profile / Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  title="Profile & Settings"
                  className="flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-700/80 px-3 py-1.5 rounded-full border border-slate-700/60 hover:border-indigo-500/50 transition-all group"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-500 group-hover:bg-indigo-400 flex items-center justify-center text-white text-xs font-bold uppercase transition-colors">
                    {user.name ? user.name[0] : "U"}
                  </div>
                  <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                    {user.name}
                  </span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full font-mono">
                    Profile
                  </span>
                </Link>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 transition-all hover:scale-102"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-2">
          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 pb-3 border-b border-slate-800 hover:opacity-90"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm uppercase">
                  {user.name ? user.name[0] : "U"}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-400">{user.email}</div>
                </div>
                <span className="text-xs text-indigo-400 font-medium">Profile →</span>
              </Link>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      active
                        ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onLogout) onLogout();
                }}
                className="w-full flex items-center justify-center space-x-2 mt-2 px-3 py-2 rounded-lg text-sm font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
