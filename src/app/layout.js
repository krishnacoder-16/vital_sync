import "./globals.css";
import { AuthProvider } from "../components/auth/AuthProvider";

export const metadata = {
  title: "VitalSync",
  description: "Smart Healthcare, Simplified",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
