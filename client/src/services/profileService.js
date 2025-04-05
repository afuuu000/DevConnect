import axios from "axios";
import API from './api';
const API_URL = "http://localhost:5000/api/users";

export const getProfile = async () => {
  return axios
    .get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
    .then((res) => res.data);
};
