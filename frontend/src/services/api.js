import axios from 'axios';

export const BASE_URL = "http://127.0.0.1:8000/";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || BASE_URL,  
  withCredentials: true                  
});

export default api;