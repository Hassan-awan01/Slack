"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
// import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  //   return <ConvexProvider client={convex}>{children}</ConvexProvider>;
  return (
    <ConvexAuthNextjsProvider client={convex}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}
