import { getAuthUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export function checkPermission(authUser, requiredPermission) {
  if (!authUser) return false;
  if (authUser.role === "ADMIN") return true;
  if (authUser.role === "SUB_ADMIN" && authUser.permissions?.includes(requiredPermission)) return true;
  return false;
}

export function guardPermission(requiredPermission) {
  return async function(req, handler) {
    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (authUser.role === "ADMIN") {
      return handler(req, authUser);
    }

    if (authUser.role === "SUB_ADMIN" && authUser.permissions?.includes(requiredPermission)) {
      return handler(req, authUser);
    }

    return NextResponse.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 });
  };
}

export function requireRole(...roles) {
  return async function(req, handler) {
    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (!roles.includes(authUser.role)) {
      return NextResponse.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 });
    }

    return handler(req, authUser);
  };
}
