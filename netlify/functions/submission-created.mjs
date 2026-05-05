import { getStore } from "@netlify/blobs";

export default async (req) => {
  const payload = await req.json();
  const data = payload.payload || payload;
  const formName = data.form_name;

  const store = getStore("tracker");
  const existing = await store.get("people", { type: "json" }) || [];
  const email = (data.data?.email || '').toLowerCase().trim();

  if (formName === 'courtney-scrapbook') {
    const name = data.data?.['full-name'] || 'Unknown';
    const method = data.data?.['letter-method'] || '';
    const photosAnswer = data.data?.photos || '';
    const photosPlanned = photosAnswer.toLowerCase().includes('yes');

    const alreadyExists = existing.some(
      p => p.email === email
    );

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
      const name = data.data?.['full-name'] || 'Unknown';
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

  return new Response('ok', { status: 200 });
};

export const config = {
  path: "/.netlify/functions/submission-created"
};
