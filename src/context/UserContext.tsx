"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { api } from "../services/api";
import type { ReactNode } from "react";
import { getAuthToken, getAuthTokenPayload } from "../services/auth/authSession";

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

function readStoredUser() {
  const raw = localStorage.getItem('auth:user')
  if (!raw) return null

  try {
    return JSON.parse(raw) as { name?: string; email?: string }
  } catch {
    return null
  }
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getUser = async () => {
    try {
      setLoading(true);
      const token = getAuthToken()
      const payload = getAuthTokenPayload(token)
      const storedUser = readStoredUser()

      const fallbackUser: User | null = storedUser
        ? {
            id: String(payload?.sub ?? payload?.id ?? payload?.userId ?? payload?.uuid ?? ''),
            name:
              typeof storedUser.name === 'string' && storedUser.name.trim()
                ? storedUser.name
                : typeof payload?.name === 'string' && payload.name.trim()
                  ? payload.name
                  : typeof payload?.email === 'string' && payload.email.trim()
                    ? payload.email.split('@')[0]
                    : '',
            email:
              typeof storedUser.email === 'string' && storedUser.email.trim()
                ? storedUser.email
                : typeof payload?.email === 'string'
                  ? payload.email
                  : '',
          }
        : null

      const userId =
        typeof payload?.sub === 'string'
          ? payload.sub
          : typeof payload?.id === 'string'
            ? payload.id
            : typeof payload?.userId === 'string'
              ? payload.userId
              : typeof payload?.uuid === 'string'
                ? payload.uuid
                : ''

      if (!userId) {
        setUser(fallbackUser)
        return
      }

      const response = await api.get(`/users/${userId}`)
      setUser(response.data)
    } catch (error) {
      console.error("Erro ao buscar usuário", error);
      const storedUser = readStoredUser()
      setUser(
        storedUser
          ? {
              id: '',
              name: storedUser.name ?? '',
              email: storedUser.email ?? '',
            }
          : null
      );
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
