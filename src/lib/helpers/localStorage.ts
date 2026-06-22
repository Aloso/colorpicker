export function getLocallyStoredState<T>(name: string, version: number) {
  const savedState = localStorage.getItem(name);
  if (savedState !== null) {
    const { version, ...state }: T & { version: number } =
      JSON.parse(savedState);
    if (version === version) return state;
  }
}

export function saveLocallyStoredState<T>(
  name: string,
  version: number,
  state: T,
) {
  localStorage.setItem(name, JSON.stringify({ version, ...state }));
}
