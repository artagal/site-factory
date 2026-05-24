import { redirect } from "next/navigation";

export default function DailyRedirectPage() {
  redirect("/find?when=today");
}
