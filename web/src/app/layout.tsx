import type { Metadata } from "next";
import { Comic_Neue } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const comicNeue = Comic_Neue({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jobio - Playful Job Board",
  description: "A Neo-Brutalist job board platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${comicNeue.className} min-h-full flex flex-col bg-brutal-bg text-black`}>
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
