import { getStore } from "@netlify/blobs";

export default async (req) => {
  const payload = await req.json();
  const data = payload.payload || payload;

  if (data.form_name !== 'courtney-scrapbook') {
    return new Response('ignored', { status: 200 });
  }

  const store = getStore("tracker");
  const existing = await store.get("people", { type: "json" }) || [];

  const name = data.data?.['full-name'] || data.data?.name || 'Unknown';
  const method = data.data?.['letter-method'] || '';
  const photosAnswer = data.data?.photos || '';
  const photosPlanned = photosAnswer.toLowerCase().includes('yes');

  const alreadyExists = existing.some(
    p => p.name.toLowerCase() === name.toLowerCase()
  );

  if (!alreadyExists) {
    existing.push({
      name: name,
      method: method,
      letterDone: false,
      photosPlanned: photosPlanned,
      photosDone: false
    });
    await store.setJSON("people", existing);
  }

  return new Response('ok', { status: 200 });
};

export const config = {
  path: "/.netlify/functions/submission-created"
};
