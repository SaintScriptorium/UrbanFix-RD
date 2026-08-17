import axiosClient from './axiosClient';

// Cada función devuelve solo lo que el resto de la app necesita (data),
// dejando que quien la llama (AuthContext) decida qué hacer con el error:
// axios ya adjunta la respuesta del backend en error.response.data.

export const registerUser = async ({ fullName, email, password }) => {
  const { data } = await axiosClient.post('/auth/register', { fullName, email, password });
  return data;
};

export const loginUser = async ({ email, password }) => {
  const { data } = await axiosClient.post('/auth/login', { email, password });
  return data;
};
