export interface User {
  id: string;
  email: string;
  name: string;
  walletAddress?: string;
  role: 'admin' | 'voter';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserLoginDto {
  email: string;
  password: string;
}

export interface UserRegistrationDto {
  email: string;
  password: string;
  name: string;
  walletAddress?: string;
}