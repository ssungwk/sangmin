export function formatSpec(width: number, height: number, thickness: number | null) {
  return thickness == null ? `${width}*${height}` : `${width}*${height}*${thickness}T`;
}
