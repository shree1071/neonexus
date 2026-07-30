import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fulcrum - The Future of Learning",
  description: "Transform your notes into interactive 3D simulations. AI-powered learning platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#050505] text-slate-200 antialiased selection:bg-indigo-500/30">
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
