import { z } from 'zod';

import { createApiResponseSchema } from './schemas';

export type ApiResponse<T> = {
  data: T;
  statusCode: number;
};

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
    config?: RequestInit;
    schema?: z.ZodSchema<T>;
  }
): Promise<ApiResponse<T>> => {
  const { params, data, config, schema } = options ?? {};
  let fullUrl = `${import.meta.env.VITE_API_URL}${url}`;

  if (method === HttpVerbs.Get && params) {
    const query = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    fullUrl += `?${query}`;
  }

  const response = await fetch(fullUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: method !== HttpVerbs.Get && data ? JSON.stringify(data) : undefined,
    ...config
  });

  const responseData = await response.json();

  const result: ApiResponse<unknown> = {
    data: responseData,
    statusCode: response.status
  };

  if (schema) {
    const apiSchema = createApiResponseSchema(schema);

    try {
      const validated = apiSchema.parse(result);

      return validated as ApiResponse<T>;
    } catch (error) {
      console.warn(error);
      throw error;
    }
  }

  return result as ApiResponse<T>;
};

export const $api = {
  get: <T, P = unknown>(
    url: string,
    schema: z.ZodSchema<T>,
    params?: P,
    config?: RequestInit
  ) => httpRequest<T, P, never>(HttpVerbs.Get, url, { params, config, schema }),

  post: <T, D = unknown>(
    url: string,
    schema: z.ZodSchema<T>,
    data?: D,
    config?: RequestInit
  ) => httpRequest<T, never, D>(HttpVerbs.Post, url, { data, config, schema }),

  put: <T, D = unknown>(
    url: string,
    schema: z.ZodSchema<T>,
    data?: D,
    config?: RequestInit
  ) => httpRequest<T, never, D>(HttpVerbs.Put, url, { data, config, schema }),

  patch: <T, D = unknown>(
    url: string,
    schema: z.ZodSchema<T>,
    data?: D,
    config?: RequestInit
  ) => httpRequest<T, never, D>(HttpVerbs.Patch, url, { data, config, schema }),

  delete: <T, P = unknown>(
    url: string,
    schema: z.ZodSchema<T>,
    params?: P,
    config?: RequestInit
  ) =>
    httpRequest<T, P, never>(HttpVerbs.Delete, url, { params, config, schema })
};
