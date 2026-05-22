import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "NNGW Canteen - Staff Food Ordering System",
  description: "Order delicious meals delivered to your office",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}