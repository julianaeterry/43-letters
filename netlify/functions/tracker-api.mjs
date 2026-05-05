import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("tracker");

  if (req.method === "GET") {
    const data = await store.get("people", { type: "json" });
    return new Response(JSON.stringify(data || []), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "PUT") {
    const people = await req.json();
    await store.setJSON("people", people);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
};
