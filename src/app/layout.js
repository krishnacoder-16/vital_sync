import "./globals.css";
import { AuthProvider } from "../components/auth/AuthProvider";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "VitalSync",
  description: "Smart Healthcare, Simplified",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Toaster position="top-center" />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
