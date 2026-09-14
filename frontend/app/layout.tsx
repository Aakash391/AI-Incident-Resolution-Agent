import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../lib/theme";

export const metadata: Metadata = {
  title: "AI Incident Resolution",
  description:
    "AI-powered incident investigation and resolution.",
};

/**
 * Bootstraps the theme before first paint to avoid a flash of the wrong
 * theme. Mirrors the logic in `lib/theme.tsx` (class on <html>).
 */
const themeBootstrap = `(function(){
  try {
    var stored = window.localStorage.getItem("incident-resolution-theme");
    var dark = stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  } catch (e) {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}