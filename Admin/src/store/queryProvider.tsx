"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode } from "react";

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 2, // 2 min
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
