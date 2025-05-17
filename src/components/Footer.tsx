import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-bold">BlueHire</span>
          </Link>
          <p className="text-center text-sm leading-loose md:text-left">
            &copy; {new Date().getFullYear()} BlueHire. All rights reserved.
          </p>
        </div>
        <div className="flex flex-col gap-4 md:ml-auto md:flex-row md:gap-6">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            This is a development version. Authentication is bypassed for testing.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
