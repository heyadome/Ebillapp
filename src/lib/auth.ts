import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session-token")?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          active: true,
        },
      },
    },
  });

  if (!session || session.expires < new Date() || !session.user.active) {
    return null;
  }

  return session.user;
}
