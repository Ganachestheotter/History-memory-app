(async () => {
  const app = document.getElementById('app');
  try {
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('你的瀏覽器版本太舊，請更新瀏覽器後再試。');
    }

    const loadCompressed = async (paths) => {
      const parts = await Promise.all(paths.map(async (path) => {
        const r = await fetch(path, { cache: 'no-cache' });
        if (!r.ok) throw new Error('載入失敗');
        return (await r.text()).trim();
      }));
      const binary = atob(parts.join(''));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      return await new Response(stream).text();
    };

    if (app) app.innerHTML = '<div class="shell"><div class="card" style="margin-top:20vh;text-align:center"><b>載入中…</b></div></div>';

    const questionsCode = await loadCompressed([
      './payload/questions-0.gz.b64',
      './payload/questions-1.gz.b64'
    ]);
    (0, eval)(questionsCode);

    const appCode = await loadCompressed(['./payload/app.js.gz.b64']);
    (0, eval)(appCode);
  } catch (err) {
    console.error(err);
    if (app) app.innerHTML = '<div class="shell"><div class="card" style="margin-top:20vh"><h2>載入失敗</h2><p>請重新整理頁面，或更新瀏覽器後再試。</p></div></div>';
  }
})();