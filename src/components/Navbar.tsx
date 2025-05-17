import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { UserCircle, LogOut, LayoutDashboard, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">BlueHire</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/jobs"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Jobs
            </Link>
            <Link 
              to="/quick-jobs" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Quick Services
            </Link>
            {isAuthenticated && user?.role === 'worker' && (
              <Link 
                to="/worker/dashboard" 
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                My Applications
              </Link>
            )}
            {isAuthenticated && user?.role === 'recruiter' && (
              <Link 
                to="/recruiter/dashboard" 
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Manage Jobs
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user?.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to={user?.role === 'worker' ? '/worker/dashboard' : '/recruiter/dashboard'}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={user?.role === 'worker' ? '/worker/profile' : '/recruiter/profile'}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
