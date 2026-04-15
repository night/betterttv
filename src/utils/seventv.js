export function wasSeventvInstalled() {
  const workerAddr = window.localStorage.getItem('seventv_worker_addr');
  return workerAddr != null;
}
