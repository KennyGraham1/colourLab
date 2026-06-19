import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppStateProvider } from "@/store/AppStateProvider";

export const metadata: Metadata = {
  title: "Colour Lab — learn how colours work",
  description:
    "An interactive lab for learning colour theory through hands-on mixing: additive & subtractive mixing, a colour wheel, harmonies, challenges and palettes.",
  applicationName: "Colour Lab",
  keywords: [
    "colour theory",
    "color mixing",
    "colour wheel",
    "RGB",
    "HSL",
    "design",
    "education",
  ],
  authors: [{ name: "Colour Lab" }],
};

export const viewport: Viewport = {
  themeColor: "#6366F1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
