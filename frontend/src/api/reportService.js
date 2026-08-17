import axiosClient from './axiosClient';

export const fetchReports = async (category) => {
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
