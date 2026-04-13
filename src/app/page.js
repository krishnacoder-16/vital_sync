import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect the root page to the login page
  redirect("/login");
}
