import { useEffect } from "react";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import Head from "next/head";
import "@/index.css";
import { apiFetch } from "@/lib/api";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes default
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function NextApp({ Component, pageProps }: AppProps) {
  // Aggressive Bootstrap: Warm up the backend and populate cache on start
  useEffect(() => {
    const bootstrap = async () => {
      const keys = ['students', 'records', 'staff', 'transport'];
      keys.forEach(key => {
        queryClient.prefetchQuery({
          queryKey: [key],
          queryFn: () => apiFetch(key === 'transport' ? '/transport' : `/${key}`),
          staleTime: 1000 * 60 * 10,
        });
      });
    };

    // Small delay to ensure auth is initialized if needed
    const timer = setTimeout(bootstrap, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>RCA - Discipline  System</title>
        <meta name="description" content="Official Rwanda Coding Academy - Discipline Management System" />
        <link rel="icon" href="/rca-logo.jpg" />
        <link rel="shortcut icon" href="/rca-logo.jpg" />
        <link rel="apple-touch-icon" href="/rca-logo.jpg" />
        <meta property="og:image" content="/rca-logo.jpg" />
        <meta name="twitter:image" content="/rca-logo.jpg" />
      </Head>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Component {...pageProps} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
