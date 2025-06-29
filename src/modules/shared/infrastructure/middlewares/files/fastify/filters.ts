export const fastifyImageFilter = (mimetype: string): boolean => {
  const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/gif", "image/webp"];
  return allowedTypes.includes(mimetype);
};