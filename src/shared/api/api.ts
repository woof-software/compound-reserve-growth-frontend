import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

export type SuccessfulResponse<T> = {
  data: T;
  error?: never;
  statusCode?: number;
};
export type UnsuccessfulResponse<E> = {
  data?: never;
  error: E;
  statusCode?: number;
};

export interface IApiError {
  message: string;
}

export type ApiResponse<T, E = IApiError> =
  | SuccessfulResponse<T>
  | UnsuccessfulResponse<E>;

export enum HttpVerbs {
  Delete = 'DELETE',
  Get = 'GET',
  Patch = 'PATCH',
  Post = 'POST',
  Put = 'PUT'
}

const httpRequest = async <T>(
  method: HttpVerbs,
  url: string,
  paramsOrData?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T, IApiError>> => {
  const requestConfig: AxiosRequestConfig = {
    ...config,

    url: `${import.meta.env.VITE_LOCAL_DOMAIN_NAME}${url}`,

    method,

    params: method === HttpVerbs.Get ? paramsOrData : undefined,

    data: method !== HttpVerbs.Get ? paramsOrData : undefined,

    headers: {
      ...config?.headers,

      authorization: '',

      accept: 'application/json'
    }
  };

  try {
    const response: AxiosResponse<T> = await axios(requestConfig);

    return {
      data: response.data,

      statusCode: response.status
    };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      return {
        data: undefined,

        error
      };
    }

    return {
      data: undefined,

      error: { message: 'Unexpected error occurred' }
    };
  }
};

export const $api = {
  get: async <T>(url: string, params?: any, config?: AxiosRequestConfig) =>
    httpRequest<T>(HttpVerbs.Get, url, params, config),

  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    httpRequest<T>(HttpVerbs.Put, url, data, config),

  patch: async <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    httpRequest<T>(HttpVerbs.Patch, url, data, config),

  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    httpRequest<T>(HttpVerbs.Post, url, data, config),

  delete: async <T>(url: string, config?: AxiosRequestConfig) =>
    httpRequest<T>(HttpVerbs.Delete, url, null, config)
};
