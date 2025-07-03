// app/api/users/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }  // Still string in URL params
) {
  const userId = parseInt(params.id, 10)
  if (isNaN(userId)) {
    return new Response("Invalid ID", { status: 400 })
  }
  // ... rest of implementation
}