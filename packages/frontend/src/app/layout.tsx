import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]";
import { redirect } from "next/navigation";
import { mongooseConnect } from "@/lib/mongoose";

import "@/theme/global.css";
import Header from "../components/header";

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
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
