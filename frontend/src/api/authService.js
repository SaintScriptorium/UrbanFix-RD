import axiosClient from './axiosClient';

export const registerUser = async ({ fullName, email, password }) => {
  const { data } = await axiosClient.post('/auth/register', { fullName, email, password });
  return data;
};

export const loginUser = async ({ email, password }) => {
  const { data } = await axiosClient.post('/auth/login', { email, password });
  return data;
};
