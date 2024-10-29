import "./globals.css";
import { ThemeProvider } from './context/ThemeContext';

export const metadata = {
  title: "Mate Finder",
  description: "Find your perfect study mate",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
