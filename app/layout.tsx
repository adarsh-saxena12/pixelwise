import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import {ClerkProvider} from '@clerk/nextjs'
import { ThemeProvider } from "@/components/shared/ThemeProvider";

const IBMPlex = IBM_Plex_Sans({
   subsets: ["latin"] ,
   weight:['400', '500', '600', '700'],
   variable:'--font-ibm-plex'
  });

export const metadata: Metadata = {
  title: "Imaginate",
  description: "AI-powred image generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <ClerkProvider appearance={{
      variables: { colorPrimary: "#624cf5"}
    }}>
    
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-IBMPlex antialiased", IBMPlex.variable)}>
      <ThemeProvider>
      {children}
      </ThemeProvider>
      
      </body>
    </html>

    </ClerkProvider>
  );
}
