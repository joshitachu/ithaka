import React from "react";

export const metadata = {
  title: "Login",
};

// Minimal layout for /login: do not render the main sidebar or other UI.
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        {children}
      </body>
    </html>
  );
}
