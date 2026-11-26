(() => {
  const requests = new WeakMap();

  window.cadaGotaRecentList = async (root, fetchPage, renderItem, labels) => {
    const previous = root.querySelector('details');
    const key = labels.key;
    const wasOpen = previous?.open && previous.dataset.key === key;
    const request = {};
    requests.set(root, request);
    root.textContent = labels.loading;

    const latest = await fetchPage(0, 3);
    if (requests.get(root) !== request) return;
    if (latest.error) {
      root.textContent = labels.error;
      return;
    }

    const rows = latest.data || [];
    if (!rows.length) {
      root.textContent = labels.empty;
      return;
    }

    root.replaceChildren(...rows.slice(0, 3).map(renderItem));
    if (rows.length < 4) return;

    const details = document.createElement('details');
    details.dataset.key = key;
    details.className = 'cada-activity-details';
    const summary = document.createElement('summary');
    summary.textContent = labels.more;
    const older = document.createElement('div');
    details.append(summary, older);
    root.append(details);

    let loaded = false;
    let loading = false;
    async function loadOlder() {
      if (!details.open || loaded || loading) return;
      loading = true;
      older.textContent = labels.loading;
      const items = [];
      for (let start = 3;; start += 100) {
        const { data, error } = await fetchPage(start, start + 99);
        if (requests.get(root) !== request) return;
        if (error) {
          older.textContent = labels.error;
          loading = false;
          return;
        }
        const page = data || [];
        items.push(...page.map(renderItem));
        if (page.length < 100) break;
      }
      older.replaceChildren(...items);
      loaded = true;
      loading = false;
    }

    details.addEventListener('toggle', loadOlder);
    if (wasOpen) details.open = true;
  };
})();
