"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { api } from "../services/api";
import type { ReactNode } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isPremium?: boolean;
  createdAt?: string;
};

type UserContextType = {
  user: User | null;
  loading: boolean;
  getUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getUser = async () => {
    try {
      setLoading(true);

      const response = await api.get("/users/me");
      setUser(response.data);
    } catch (error) {
      console.error("Erro ao buscar usuário", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      getUser();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        getUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser precisa estar dentro do UserProvider");
  }

  return context;
};
