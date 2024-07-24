// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

console.log("🐒 ~ API Base URL:", api.defaults.baseURL);

// Test request to log the response
api.get('/test')
  .then(response => {
    console.log("🐒 ~ Test Request Response:", response);
  })
  .catch(error => {
    console.error("🐒 ~ Test Request Error:", error);
  });

export default api;