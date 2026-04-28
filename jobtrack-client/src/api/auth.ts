import client from "./client";
import type { ApiSuccess, User } from "../types";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Authenticate a user and return user data with a JWT token.
export const login = async (input: LoginInput): Promise<AuthResponse> => {
  const { data } = await client.post<ApiSuccess<AuthResponse>>(
    "/auth/login",
    input,
  );
  return data.data;
};

// Create a new account and return user data with a JWT token.
export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  const { data } = await client.post<ApiSuccess<AuthResponse>>(
    "/auth/register",
    input,
  );
  return data.data;
};

// Fetch the currently authenticated user's profile.
export const getMe = async (): Promise<User> => {
  const { data } = await client.get<ApiSuccess<User>>("/auth/me");
  return data.data;
};
