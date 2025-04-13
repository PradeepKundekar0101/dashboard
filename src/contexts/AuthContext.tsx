"use client";
import { jwtDecode } from "jwt-decode";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { config } from "@/config";
import { api } from "@/hooks/useAxios";
import { Mentor } from "@/types";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  mentor: Mentor | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication status on initial load
  useEffect(() => {
    const verifyAuth = () => {
      const token = localStorage.getItem("authToken");

      if (token) {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp && decodedToken.exp < currentTime) {
          localStorage.removeItem("authToken");
          setIsAuthenticated(false);
          router.push("/login");
        } else {
          setIsAuthenticated(true);
          const mentor = localStorage.getItem("mentor");
          if (mentor) {
            setMentor(JSON.parse(mentor));
          }
        }
      } else {
        setIsAuthenticated(false);
        router.push("/login");
      }

      setIsLoading(false);
    };

    verifyAuth();
  }, [router]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post(`/forexAdmin/login`, {
        admin_email: email,
        admin_password: password,
      });

      if (response.status !== 200) {
        throw new Error(response.data.message || "Login failed");
      }
      console.log(response.data);
      localStorage.setItem("authToken", response.data.token);
      if (response.data.mentor) {
        setMentor(response.data.mentor);
        localStorage.setItem("mentor", JSON.stringify(response.data.mentor));
      }
      setIsAuthenticated(true);
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.apiServer}/forexAdmin/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setIsAuthenticated(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, login, logout, mentor }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
