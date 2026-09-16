import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Syllo — Todo tu estudio en un solo lugar",
  description:
    "Syllo reúne los correos de Google Classroom y de tu universidad y las tareas de todos tus cursos en un solo panel, más tus notas personales y un calendario con todos los vencimientos. Próximamente: recordatorios.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} h-full antialiased`}
    >
      <head>
        {/*
          Decide el tema antes del primer pintado, si no la página aparece en
          claro y salta a oscuro un instante después. Por eso va inline en el
          `head` y no en un efecto, y por eso `<html>` lleva
          `suppressHydrationWarning`: el servidor no puede saber el tema.

          Sin elección guardada se sigue al sistema operativo.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var e=localStorage.getItem("syllo-tema"),o=e?e==="oscuro":matchMedia("(prefers-color-scheme: dark)").matches;o&&document.documentElement.classList.add("dark")}catch(t){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
