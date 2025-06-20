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
  }
): Promise<ApiResponse<T>> => {
  const { params, data, config } = options ?? {};
  let fullUrl = `${import.meta.env.VITE_API_URL}${url}`;

  if (method === HttpVerbs.Get && params) {
    const query = new URLSearchParams(params as Record<string, any>).toString();
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

  const responseData = (await response.json()) as T;

  return {
    data: responseData,
    statusCode: response.status
  };
};

export const $api = {
  get: <T, P = unknown>(url: string, params?: P, config?: RequestInit) =>
    httpRequest<T, P, never>(HttpVerbs.Get, url, { params, config }),

  post: <T, D = unknown>(url: string, data?: D, config?: RequestInit) =>
    httpRequest<T, never, D>(HttpVerbs.Post, url, { data, config }),

  put: <T, D = unknown>(url: string, data?: D, config?: RequestInit) =>
    httpRequest<T, never, D>(HttpVerbs.Put, url, { data, config }),

  patch: <T, D = unknown>(url: string, data?: D, config?: RequestInit) =>
    httpRequest<T, never, D>(HttpVerbs.Patch, url, { data, config }),

  delete: <T, P = unknown>(url: string, params?: P, config?: RequestInit) =>
    httpRequest<T, P, never>(HttpVerbs.Delete, url, { params, config })
};
