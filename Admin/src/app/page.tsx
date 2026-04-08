import { redirect } from "next/navigation";

// Root "/" always redirects — middleware handles it,
// but this fallback ensures no blank page.
export default function RootPage() {
  redirect("/login");
}
