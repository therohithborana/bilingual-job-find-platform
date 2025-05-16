
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-bluehire-600">
                {t("common.appName")}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <Link
              to="/jobs"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-bluehire-600 hover:bg-gray-50"
            >
              {t("navigation.jobs")}
            </Link>
            <Link
              to="/quick-jobs"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-bluehire-600 hover:bg-gray-50"
            >
              {t("navigation.quickJobs")}
            </Link>
            {user && (
              <Link
                to={user.role === 'worker' ? '/worker/profile' : '/recruiter/dashboard'}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-bluehire-600 hover:bg-gray-50"
              >
                {t("navigation.profile")}
              </Link>
            )}
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <LanguageSwitcher />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full bg-white">
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-bluehire-100 flex items-center justify-center text-bluehire-800 font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={user.role === 'worker' ? '/worker/profile' : '/recruiter/dashboard'}>
                      {t("navigation.profile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>{t("auth.signOut")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login">
                  <Button variant="ghost">{t("auth.signIn")}</Button>
                </Link>
                <Link to="/register">
                  <Button variant="default">{t("auth.signUp")}</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-bluehire-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/jobs"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-bluehire-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("navigation.jobs")}
            </Link>
            <Link
              to="/quick-jobs"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-bluehire-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("navigation.quickJobs")}
            </Link>
            {user && (
              <Link
                to={user.role === 'worker' ? '/worker/profile' : '/recruiter/dashboard'}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-bluehire-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("navigation.profile")}
              </Link>
            )}
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200">
            <LanguageSwitcher />
            
            {user ? (
              <div className="mt-3 space-y-1">
                <div className="block px-4 py-2 text-base font-medium text-gray-500">
                  {user.name}
                </div>
                <Link
                  to={user.role === 'worker' ? '/worker/profile' : '/recruiter/dashboard'}
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-bluehire-600 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("navigation.profile")}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-bluehire-600 hover:bg-gray-100"
                >
                  {t("auth.signOut")}
                </button>
              </div>
            ) : (
              <div className="mt-3 space-y-1 px-4">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-bluehire-600 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("auth.signIn")}
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-bluehire-600 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("auth.signUp")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
