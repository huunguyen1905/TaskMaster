// Manually declare process.env to support the API_KEY polyfill usage
declare const process: {
  env: {
    API_KEY: string;
    [key: string]: any;
  }
};
