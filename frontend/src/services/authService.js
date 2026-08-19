// authService.js

import axios from "axios";

const API = "http://localhost:8080/api/auth";

export const register = (data) => {
    return axios.post(`${API}/register`, data);
};

export const login = (data) => {
    return axios.post(`${API}/login`, data);
};