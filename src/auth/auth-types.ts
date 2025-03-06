export enum AuthAction {
  Login = 'login',
  Register = 'register'
}

export interface AuthRequest {
  email: string,
  password: string
}

export interface AuthFormValues extends AuthRequest {}
