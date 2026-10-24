import '../styles/globals.css';
import { getCurrentUser } from '@/lib/auth';
import AppWrapper from '@/components/AppWrapper';

export const metadata = {
  title: 'Goumin - Entraide & soutien deuil amoureux',
  description: 'Goumin est une plateforme d\'entraide communautaire pour surmonter le deuil amoureux au Sénégal et en Afrique de l\'Ouest.',
  manifest: '/manifest.json',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0915" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Goumin" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body>
        <AppWrapper user={user}>
          {children}
        </AppWrapper>
      </body>
    </html>
  );
}
