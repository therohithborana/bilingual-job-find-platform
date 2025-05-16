
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  const { t } = useTranslation();
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("worker");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password, role);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-bluehire-800">
            {t("auth.signIn")}
          </CardTitle>
          <CardDescription className="text-center">
            {t("common.appName")} - {t("common.tagline")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                {isLoading ? "Loading..." : t("auth.signIn")}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Link to="#" className="text-sm text-bluehire-600 hover:text-bluehire-500">
            {t("auth.forgotPassword")}
          </Link>
          <div className="text-sm text-gray-600">
            {t("auth.noAccount")}{" "}
            <Link to="/register" className="font-medium text-bluehire-600 hover:text-bluehire-500">
              {t("auth.signUp")}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
