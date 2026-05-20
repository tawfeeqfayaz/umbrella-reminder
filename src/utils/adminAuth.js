const STORAGE_KEY = "admin.authed.v1";

export function isAdminAuthed() {
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

export function setAdminAuthed(value) {
  window.localStorage.setItem(STORAGE_KEY, value ? "true" : "false");
}

export function clearAdminAuth() {
  window.localStorage.removeItem(STORAGE_KEY);
}

