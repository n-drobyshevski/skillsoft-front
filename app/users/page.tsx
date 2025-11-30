import { redirect } from "next/navigation";

/**
 * Redirect from old /users route to new /admin/users
 */
export default function UsersRedirect() {
  redirect("/admin/users");
}
