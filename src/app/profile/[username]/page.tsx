import { permanentRedirect } from "next/navigation";
import { getProfileUrl } from "@/lib/routes";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfileUsernameRedirect({ params }: PageProps) {
  const { username } = await params;
  permanentRedirect(getProfileUrl(decodeURIComponent(username)));
}
