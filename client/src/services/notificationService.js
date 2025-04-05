import API from './api';
export const getNotifications = async () => {
  const response = await API.get('/notifications');
  return response.data;
};