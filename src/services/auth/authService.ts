import { api } from "../api";
import {
  getAuthToken,
  logoutAndNotify,
  setAuthToken,
} from "./authSession";

export interface SignDto {
  email: string;
  password: string;
}

export interface CreateUser {
  name: string;
  email: string;
  password: string;
}

export interface SignInResponse {
  email: string;
  password: string;
  token: string;
  name?: string;
}

export const authService = {
  async signIn(data: SignDto): Promise<SignInResponse> {
    const response = await api.post<SignInResponse>("/auth/signin", data);

    setAuthToken(response.data.token);
    localStorage.setItem(
      'auth:user',
      JSON.stringify({
        email: response.data.email,
        name: response.data.name ?? response.data.email?.split('@')[0] ?? '',
      })
    );

    return response.data;
  },

  async createUser(data: CreateUser): Promise<SignInResponse> {
    const response = await api.post<SignInResponse>("/users", data);

    setAuthToken(response.data.token);
    localStorage.setItem(
      'auth:user',
      JSON.stringify({
        email: response.data.email,
        name: response.data.name ?? data.name,
      })
    );

    return response.data;
  },

  async LogOut() {
    logoutAndNotify();
  },

  getToken() {
    return getAuthToken();
  },
};
