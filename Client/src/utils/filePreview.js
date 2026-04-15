const filePreviewCache = new WeakMap();

export const getFilePreviewUrl = (file) => {
  if (!(file instanceof Blob)) return "";

  const cachedUrl = filePreviewCache.get(file);
  if (cachedUrl) return cachedUrl;

  const nextUrl = URL.createObjectURL(file);
  filePreviewCache.set(file, nextUrl);
  return nextUrl;
};

export const revokeFilePreviewUrl = (file) => {
  if (!(file instanceof Blob)) return;

  const cachedUrl = filePreviewCache.get(file);
  if (!cachedUrl) return;

  URL.revokeObjectURL(cachedUrl);
  filePreviewCache.delete(file);
};
