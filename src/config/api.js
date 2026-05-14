// This file determines the API URL based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin + '/api'
  : 'http://localhost:5000/api';

export default API_BASE_URL;
