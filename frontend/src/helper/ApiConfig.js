import axios from "axios";
// process.env.VUE_APP_API_URL +
const ApiRequest = axios.create({
    baseURL:  '/api'
});


ApiRequest.interceptors.request.use((config) => {
    config.headers["api-key"] = 'JerwinServitoSecretKey' //process.env.VUE_APP_API_KEY;
    return config;
});

export default ApiRequest;
