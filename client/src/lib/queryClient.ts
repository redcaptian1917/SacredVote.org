import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log(`[DEBUG] [apiRequest] ${method} ${url}`, data ? { body: data } : '');
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    if (res.ok) {
      console.log(`[DEBUG] [apiRequest] SUCCESS: ${method} ${url} - Status ${res.status}`);
    } else {
      console.error(`[DEBUG] [apiRequest] FAILURE: ${method} ${url} - Status ${res.status}`);
    }

    await throwIfResNotOk(res);
    return res;
  } catch (err) {
    console.error(`[DEBUG] [apiRequest] EXCEPTION: ${method} ${url}`, err);
    throw err;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    console.log(`[DEBUG] [queryFn] GET ${url}`);
    try {
      const res = await fetch(url, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.warn(`[DEBUG] [queryFn] 401 Unauthorized (returning null) for: ${url}`);
        return null;
      }

      if (res.ok) {
        console.log(`[DEBUG] [queryFn] SUCCESS: GET ${url} - Status ${res.status}`);
      } else {
        console.error(`[DEBUG] [queryFn] FAILURE: GET ${url} - Status ${res.status}`);
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (err) {
      console.error(`[DEBUG] [queryFn] EXCEPTION: GET ${url}`, err);
      throw err;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
