export function resolveImageSource(src: string) {
  return src.endsWith(".png") ? `${src.slice(0, -4)}.avif` : src;
}
