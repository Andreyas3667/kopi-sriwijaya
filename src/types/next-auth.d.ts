import type { Role } from "@/lib/enums";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: {
      id: number;
      name?: string | null;
      email?: string | null;
      role: Role;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: number;
    role?: Role;
  }
}
