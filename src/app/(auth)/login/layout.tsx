import { AuthProvider } from "@/contexts/AuthContext";
import React from "react";
import "../../globals.css";
const LoginLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <div className="flex items-center justify-center h-screen">
        <AuthProvider>{children}</AuthProvider>
      </div>
    </div>
  );
};

export default LoginLayout;
