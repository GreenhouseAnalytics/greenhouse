import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]";
import { redirect } from "next/navigation";
import { mongooseConnect } from "@/lib/mongoose";
import { ThemeProvider } from "../theme";
import Layout from "../components/layout";

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
  // Connect to the DB
  await mongooseConnect();

  // Get the user session
  const session = await getServerSession(authOptions);
  if (session == null) {
    return redirect("api/auth/signin");
  }

  // Render
  return (
    <html lang="en">
      <head></head>
      <body>
        <ThemeProvider>
          <Layout>{children}</Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}
