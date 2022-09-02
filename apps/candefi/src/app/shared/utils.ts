import { TokenWithListingOptionalRenting } from '../services/rentfuse.service';

export function processBase64Hash160(base64: string): string {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[len - 1 - i] = binaryString.charCodeAt(i);
  }
  return Array.from(bytes)
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}

export function isExpired(token: TokenWithListingOptionalRenting): boolean {
  if (!token.renting) {
    return false;
  }
  return (
    token.renting.startedAt + token.renting.duration * 60 * 1000 <
    new Date().getTime()
  );
}

export function generateNumberArray(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => i + from);
}
