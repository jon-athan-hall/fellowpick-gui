import { AxiosResponse } from 'axios';

import axios from '../axios';
import { AuthRequest } from './auth-types';

const URL_SUB = '/auth';

// Post a register.
export const postRegister = async (data: AuthRequest) => {
  const response: AxiosResponse = await axios.post(`${URL_SUB}/register`, data);
  return response.data;
};

// Post a login.
export const postLogin = async (data: AuthRequest) => {
  const response: AxiosResponse = await axios.post(`${URL_SUB}/login`, data);
  return response.data;
};
