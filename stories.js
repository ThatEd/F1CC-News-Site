window.stories = {};

function withCacheBust(url) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${Date.now()}`;
}

async function fetchFresh(url) {
  return fetch(withCacheBust(url), {
    cache: 'no-store'
  });
}

window.loadStories = async function() {
  try {
    const indexRes = await fetchFresh('news/index.json');
    if (!indexRes.ok) {
      console.error('Failed to load news/index.json');
      return;
    }
    const keys = await indexRes.json();
    const jsonFiles = keys.map(k => k.endsWith('.json') ? k : k + '.json');

    const promises = jsonFiles.map(async (file) => {
      const key = file.replace('.json', '');
      const res = await fetchFresh(`news/${file}`);
      if (res.ok) {
        window.stories[key] = await res.json();
      }
    });

    await Promise.all(promises);
  } catch (err) {
    console.error('Error loading stories:', err);
  }
};
