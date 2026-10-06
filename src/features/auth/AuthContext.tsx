import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getCurrentUser,
  loginRequest,
} from "./api/auth.api";

import type { AuthResult, User } from "./types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (
    email: string,
    password: string,
  ) => Promise<AuthResult>;

  logout: () => Promise<void>;

  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

const STORAGE_KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  loggedIn: "isLoggedIn",
  role: "userRole",
} as const;

const clearSession = async () => {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.accessToken,
    STORAGE_KEYS.refreshToken,
    STORAGE_KEYS.loggedIn,
    STORAGE_KEYS.role,
    "userData",
  ]);
};

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthStatus = async () => {
    setLoading(true);

    try {
      const [accessToken, refreshToken] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.accessToken),
          AsyncStorage.getItem(STORAGE_KEYS.refreshToken),
        ]);

      if (!accessToken || !refreshToken) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      const response = await getCurrentUser();

      setUser(response.data);
      setIsAuthenticated(true);
    } catch {
      await clearSession();

      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    try {
      const response = await loginRequest(
        email,
        password,
      );

      if (!response.success) {
        return {
          success: false,
          message: response.message,
        };
      }

      const {
        accessToken,
        refreshToken,
      } = response.data;

      await AsyncStorage.multiSet([
        [STORAGE_KEYS.accessToken, accessToken],
        [STORAGE_KEYS.refreshToken, refreshToken],
        [STORAGE_KEYS.loggedIn, "true"],
      ]);

      const meResponse = await getCurrentUser();

      const currentUser = meResponse.data as User;

      setUser(currentUser);
      setIsAuthenticated(true);

      await AsyncStorage.setItem(
        STORAGE_KEYS.role,
        currentUser.role,
      );

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          "Login failed",
      };
    }
  };

  const logout = async () => {
    await clearSession();

    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}