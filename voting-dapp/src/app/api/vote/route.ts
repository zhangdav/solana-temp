import { ActionGetResponse, ACTIONS_CORS_HEADERS } from "@solana/actions"

export async function GET(request: Request) {
  const actionMetadata: ActionGetResponse = {
    icon: "https://zestfulkitchen.com/wp-content/uploads/2021/09/Peanut-butter_hero_for-web-2.jpg",
    title: "Vote for your favorite peanut butter!",
    description:"Vote between crunchy and smooth peanut butter.",
    label: "Vote",

  }
  return Response.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS})
}
