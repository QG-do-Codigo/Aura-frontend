import api from "../api";

export interface SignDto {
  email: string,
  password: string
}

export interface CreateUser {
  name: string,
  email: string,
  password: string
}

export interface SignInResponse {
  email:string,
  password: string,
  token: string
}

export const authService = {

  async signIn(data: SignDto): Promise<SignInResponse> {
    const response = await api.post<SignInResponse>("/auth/signin", data);

    localStorage.setItem("token", response.data.token)

    return response.data
  
  },

  async createUser(data: CreateUser): Promise<SignInResponse>{
    const response = await api.post<SignInResponse>("/users", data);

    localStorage.setItem("token", response.data.token)

    return response.data
  },


  async LogOut(){
    localStorage.removeItem("token")
  },

  getToken() {
    return localStorage.getItem("token");
  }
}