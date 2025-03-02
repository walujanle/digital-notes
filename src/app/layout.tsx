import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AlertProvider } from "@/components/Alert";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Digital Notes",
  description: "The Digital Notes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.className} antialiased text-gray-800 dark:text-gray-100 bg-white dark:bg-dark-primary transition-colors duration-200`}
      >
        <ThemeProvider>
          <AlertProvider>
            <AuthProvider>{children}</AuthProvider>
          </AlertProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
