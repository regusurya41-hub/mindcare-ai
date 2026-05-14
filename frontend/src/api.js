import axios from "axios";

const API = axios.create({
  baseURL: "https://mindcare-ai-tn9d.onrender.com/api",
});

export default API;