import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import Head from "next/head";

import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import "@/styles/globals.css";

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <AuthProvider>
      <TooltipProvider delayDuration={200}>
        <Head>
          <title>{APP_NAME}</title>
          <meta name="description" content={APP_DESCRIPTION} />
        </Head>
        {getLayout(<Component {...pageProps} />)}
        <Toaster position="top-right" richColors />
      </TooltipProvider>
    </AuthProvider>
  );
}
