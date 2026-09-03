import { permanentRedirect } from "next/navigation";

export default function ProfileRedirect() {
  permanentRedirect("/perfil");
}
