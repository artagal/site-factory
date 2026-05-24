import { jsonError } from "../../../../lib/server/api-response";

export async function POST() {
  return jsonError("Leaderboards are disabled in GoFunMotion Deals.", 410);
}
