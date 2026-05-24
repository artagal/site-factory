import { jsonError } from "../../../lib/server/api-response";

export async function POST() {
  return jsonError("The challenge generator has been replaced by GoFunMotion Deals. Use /api/plan.", 410);
}
