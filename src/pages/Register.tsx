
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Register = () => {
  const { t } = useTranslation();
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("worker");
  const [passwordError, setPasswordError] = useState("");
  
  const validatePassword = () => {
    if (password !== confirmPassword) {
      setPasswordError(t("auth.passwordMismatch") || "Passwords do not match");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    await register(name, email, password, role);
    
    // Navigate to the appropriate path based on role
    if (role === 'worker') {
      navigate('/worker/profile/new');
    } else if (role === 'recruiter') {
      navigate('/recruiter/company-register');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-bluehire-800">
            {t("auth.signUp")}
          </CardTitle>
          <CardDescription className="text-center">
            {t("common.appName")} - {t("common.tagline")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>{t("auth.selectRole")}</Label>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    id="worker"
                    type="radio"
                    name="role"
                    value="worker"
                    checked={role === "worker"}
                    onChange={() => setRole("worker")}
                    className="h-4 w-4 text-bluehire-600 focus:ring-bluehire-500 border-gray-300"
                  />
                  <Label htmlFor="worker" className="ml-2">
                    {t("auth.worker")}
                  </Label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="recruiter"
                    type="radio"
                    name="role"
                    value="recruiter"
                    checked={role === "recruiter"}
                    onChange={() => setRole("recruiter")}
                    className="h-4 w-4 text-bluehire-600 focus:ring-bluehire-500 border-gray-300"
                  />
                  <Label htmlFor="recruiter" className="ml-2">
                    {t("auth.recruiter")}
                  </Label>
                </div>
              </div>
            </div>
            
            <div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Loading..." : t("auth.signUp")}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-gray-600 w-full text-center">
            {t("auth.haveAccount")}{" "}
            <Link to="/login" className="font-medium text-bluehire-600 hover:text-bluehire-500">
              {t("auth.signIn")}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
