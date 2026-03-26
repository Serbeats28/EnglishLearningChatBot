import axios from "axios";

const ApiRequest = axios.create({
    baseURL:  process.env.VUE_APP_API_URL + '/api'
})

ApiRequest.interceptors.request.use((config) => {
    config.headers["api-key"] = process.env.VUE_APP_API_KEY
    return config;
})

export default ApiRequest;

