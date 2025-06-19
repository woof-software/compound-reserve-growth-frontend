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

const httpRequest = async <T, P = unknown, D = unknown>(
  method: HttpVerbs,
  url: string,
  options?: {
    params?: P;
    data?: D;
    config?: AxiosRequestConfig;
  }
): Promise<ApiResponse<T, IApiError>> => {
  const { params, data, config } = options ?? {};
  const requestConfig: AxiosRequestConfig = {
    ...config,
    url: `${import.meta.env.VITE_LOCAL_DOMAIN_NAME}${url}`,
    method,
    params: method === HttpVerbs.Get ? params : undefined,
    data: method !== HttpVerbs.Get ? data : undefined,
    headers: {
      ...config?.headers,
      authorization: '',
      accept: 'application/json'
    }
  };

  try {
    const response: AxiosResponse<T> = await axios(requestConfig);
    return { data: response.data, statusCode: response.status };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      return { error, data: undefined };
    }
    return { error: { message: 'Unexpected error occurred' }, data: undefined };
  }
};

export const $api = {
  get: async <T, P = unknown>(
    url: string,
    params?: P,
    config?: AxiosRequestConfig
  ) => httpRequest<T, P, never>(HttpVerbs.Get, url, { params, config }),

  post: async <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ) => httpRequest<T, never, D>(HttpVerbs.Post, url, { data, config }),

  put: async <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ) => httpRequest<T, never, D>(HttpVerbs.Put, url, { data, config }),

  patch: async <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ) => httpRequest<T, never, D>(HttpVerbs.Patch, url, { data, config }),

  delete: async <T, P = unknown>(
    url: string,
    params?: P,
    config?: AxiosRequestConfig
  ) => httpRequest<T, P, never>(HttpVerbs.Delete, url, { params, config })
};
