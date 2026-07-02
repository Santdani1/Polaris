import { redirect } from "next/navigation";

export default function Home() {
  // El middleware manda a /login si no hay sesión.
  redirect("/command");
}
