import axiosClient from './axiosClient';

// El token lo adjunta el interceptor de axiosClient, así que ninguna de
// estas funciones tiene que preocuparse por la autenticación.

export const fetchReports = async (category) => {
  // Solo mandamos el parámetro si hay filtro activo; "Ver todos" (HU10) es
  // simplemente no enviarlo.
  const params = category ? { category } : {};
  const { data } = await axiosClient.get('/reports', { params });
  return data.reports;
};

export const fetchMeta = async () => {
  const { data } = await axiosClient.get('/reports/meta');
  return data;
};

export const createReport = async (payload) => {
  const { data } = await axiosClient.post('/reports', payload);
  return data.report;
};

export const updateReport = async (id, payload) => {
  const { data } = await axiosClient.put(`/reports/${id}`, payload);
  return data.report;
};

export const deleteReport = async (id) => {
  await axiosClient.delete(`/reports/${id}`);
};

export const completeReport = async (id) => {
  const { data } = await axiosClient.patch(`/reports/${id}/complete`);
  return data.report;
};
