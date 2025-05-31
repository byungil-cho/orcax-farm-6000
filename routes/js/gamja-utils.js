export function saveNickname(name) {
  localStorage.setItem("nickname", name);
}

export function getNickname() {
  return localStorage.getItem("nickname");
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}분 ${s < 10 ? '0' : ''}${s}초`;
}
