function backupFile() {
  const rv = storage.getStorage();
  save(JSON.stringify(rv), 'bttv_settings.backup');
}

function importFile(target) {
  getDataURLFromUpload(target, (data) => {
    if (!isJSON(data)) return;

    const settingsToImport = JSON.parse(data);
    Object.keys(settingsToImport).forEach((s) => settings.set(s.split('bttv_')[1], settingsToImport[s]));

    setTimeout(() => window.location.reload(), 1000);
  });
}
