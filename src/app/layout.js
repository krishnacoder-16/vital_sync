import "./globals.css";
import { AuthProvider } from "../components/auth/AuthProvider";

export const metadata = {
  title: "VitalSync",
  description: "Smart Healthcare, Simplified",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
