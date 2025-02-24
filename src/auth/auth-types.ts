export enum AuthAction {
  Login = 'login',
  Register = 'register'
}

export interface AuthFormValues extends AuthRequest {}

export interface AuthRequest {
  email: string,
  password: string
}
