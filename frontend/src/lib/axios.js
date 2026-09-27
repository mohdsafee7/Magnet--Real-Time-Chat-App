import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api",
  withCredentials: true,
});


//This file contains the configuration for the Axios instance used throughout the application.
//The `axiosInstance` is created with a base URL that changes based on the environment (development or production) 
// and is set to include credentials in requests.