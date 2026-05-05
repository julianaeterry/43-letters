import { getStore } from "@netlify/blobs";

export default async (req) => {
  const body = await req.json();
  const data = body.payload || body;
  const formName = data.form_name;
  const fields = data.data || data.human_fields || {};
  const email = (fields['email'] || data.email || '').toLowerCase().trim();

  const store = getStore("tracker");
  const existing = await store.get("people", { type: "json" }) || [];

  if (formName === 'courtney-scrapbook') {
    const name = fields['full-name'] || data.name || 'Unknown';
    const method = fields['letter-method'] || '';
    const photosAnswer = fields['photos'] || '';
    const photosPlanned = photosAnswer.toLowerCase().includes('yes');

    const alreadyExists = existing.some(p => p.email === email);

    if (!alreadyExists) {
      existing.push({
        name: name,
        email: email,
        method: method,
        letterDone: false,
        photosPlanned: photosPlanned,
        photosDone: false
      });
      await store.setJSON("people", existing);
    }
  }

  if (formName === 'courtney-scrapbook-photos') {
    const match = existing.find(p => p.email === email);
    if (match) {
      match.photosDone = true;
      await store.setJSON("people", existing);
    } else {
      const name = fields['full-name'] || data.name || 'Unknown';
      existing.push({
        name: name,
        email: email,
        method: '',
        letterDone: false,
        photosPlanned: true,
        photosDone: true
      });
      await store.setJSON("people", existing);
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
