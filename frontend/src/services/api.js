import axios from 'axios';

export const getUserProfile = async (userId) => {
  const res = await axios.get(`/api/users/${userId}`);
  return res.data;
};

export const getUserNotifications = async (userId) => {
  const res = await axios.get(`/api/notifications/${userId}`);
  return res.data;
};