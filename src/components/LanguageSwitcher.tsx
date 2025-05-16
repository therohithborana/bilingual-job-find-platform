
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const LanguageSwitcher = () => {
  const [currentLanguage, setCurrentLanguage] = React.useState("en");

  const changeLanguage = (lng: string) => {
    setCurrentLanguage(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-1">
          <span>{currentLanguage === "en" ? "English" : "ಕನ್ನಡ"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage("en")}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage("kn")}>
          ಕನ್ನಡ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
