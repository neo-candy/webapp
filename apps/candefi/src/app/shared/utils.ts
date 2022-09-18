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

export function determineCurrentValue(
  token: TokenWithListingOptionalRenting,
  neoPrice: number
): number {
  const priceDelta =
    (token.type === 'Call'
      ? neoPrice - token.strike
      : token.strike - neoPrice) * Math.pow(10, 8);

  const leverage = priceDelta * token.leverage;
  if (!token.renting) {
    return Math.round(
      (token.value * Math.pow(10, 9) + leverage) / Math.pow(10, 9)
    );
  }
  const timeDecay =
    (new Date().getTime() - token.renting.startedAt) * token.timeDecay;
  const currentValue = Math.round(
    (token.value * Math.pow(10, 9) + leverage - timeDecay) / Math.pow(10, 9)
  );
  if (token.safe) {
    if (token.type === 'Call' && token.strike > neoPrice) {
      return 0;
    } else if (token.type === 'Put' && token.strike < neoPrice) {
      return 0;
    }
  }
  return currentValue < 0
    ? 0
    : currentValue > token.stake
    ? token.stake
    : currentValue;
}
