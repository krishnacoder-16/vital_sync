import "./globals.css";

export const metadata = {
  title: "VitalSync",
  description: "Smart Healthcare, Simplified",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
