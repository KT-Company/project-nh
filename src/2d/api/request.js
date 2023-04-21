import axios from 'axios'

const instance  = axios.create({baseURL: window.baseURL + "/nh/"})
// const instance  = axios.create({baseURL: window.baseURL + "/"})
instance.interceptors.response.use((res)=>res.data)

export default instance