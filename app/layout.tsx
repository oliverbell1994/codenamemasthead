import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Masthead Studio",
  description: "Wizard-driven, house-rule-constrained site engine.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@500;600&family=Instrument+Sans:wght@400;500;600&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
