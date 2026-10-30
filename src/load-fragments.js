// Download app.js in parallel with the fragments; it still
// runs only after the fragments are in the DOM.
const APP_SRC = 'src/app.js?v=32';
const appPreload = document.createElement('link');
appPreload.rel = 'preload';
appPreload.as = 'script';
appPreload.href = APP_SRC;
document.head.append(appPreload);

async function loadApplication() {
  const placeholders = [...document.querySelectorAll('[data-include]')];
  const fragments = await Promise.all(placeholders.map(async (placeholder) => {
    const path = placeholder.dataset.include;
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(`Could not load ${path}: ${response.status}`);
    }

    return { placeholder, markup: await response.text() };
  }));

  fragments.forEach(({ placeholder, markup }) => {
    placeholder.insertAdjacentHTML('afterend', markup);
    placeholder.remove();
  });

  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = APP_SRC;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Could not load src/app.js'));
    document.body.append(script);
  });
}

loadApplication().catch((error) => {
  console.error('Unable to load the Nukkad app:', error);
  const errorPanel = document.getElementById('app-load-error');
  errorPanel.hidden = false;
  errorPanel.textContent =
    'The store could not be loaded. Please refresh the page and try again.';
  errorPanel.style.cssText =
    'position:fixed;inset:1rem 1rem auto;z-index:9999;padding:1rem;background:#fff0ed;color:#8b1e0d;border:1px solid #d99;border-radius:8px;font:500 14px sans-serif;';
});
