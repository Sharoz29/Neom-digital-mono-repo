import axios from 'axios';
import { endpoints } from '../_services/endpoints';

const instance = axios.create({
  baseURL: endpoints.BASEURL,
  timeout: 30000,
  headers: {
    // 'X-Custom-Header': 'foobar',
    // // true: need, false: dont need
    // 'Authorization': true,
    // 'X-Requested-With': 'XMLHttpRequest'
  },
});

// In-memory cache object
const cache = {};

/**
 * Generate a unique key for each request based on the URL and params
 * @param {object} config - Axios request config
 * @returns {string} - The generated cache key
 */
function generateCacheKey(config) {
  const { method, url, params } = config;

  // Create a string with URL and params to use as a cache key
  const cacheKeyString = `${method}:${url}:${JSON.stringify(params)}`;

  console.log('Cache Key:', cacheKeyString);

  // Return a hash of the cacheKeyString to ensure uniqueness and avoid large keys
  return cacheKeyString;
}

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    // Check if the request is a GET request and has c=1 in the params string
    if (config.method === 'get' && config.params && config.params.$c == 1) {
      const cacheKey = generateCacheKey(config);

      // Check if the response is already in cache
      if (cache[cacheKey]) {
        // If cached, cancel the request by throwing a cancellation
        const response = cache[cacheKey];

        return Promise.reject({
          __fromCache: true,
          response,
        });
      }
    }

    // Proceed with the request if not cached
    return config;
  },
  (error) => {
    // Handle the error
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => {
    // Generate the cache key
    const cacheKey = generateCacheKey(response.config);

    // Check if the request is a GET request and has c=1 in the params string
    if (
      response.config.method === 'get' &&
      response.config.params &&
      response.config.params.$c === 1
    ) {
      // Store the response in cache
      cache[cacheKey] = response;
    }

    // Return the response
    return response;
  },
  (error) => {
    // Check if the error is from a cache hit
    if (error.__fromCache) {
      return Promise.resolve(error.response);
    }

    // Handle the error
    return Promise.reject(error);
  }
);

export default instance;
