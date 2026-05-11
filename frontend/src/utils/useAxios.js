// useAxios is kept for backward compatibility but all requests now go through
// apiInstance (axios.js) which handles auth and token refresh automatically.
// This hook simply returns the same apiInstance.
import apiInstance from './axios';

const useAxios = () => apiInstance;

export default useAxios;
