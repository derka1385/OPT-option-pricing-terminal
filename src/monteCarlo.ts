import type { MonteCarloResult, OptionType } from "./types";

export function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function boxMuller(rand: () => number): number {
  const u1 = Math.max(rand(), 1e-10);
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// GBM under the risk-neutral measure with antithetic variates: each draw z also drives a mirror path with -z,
// and the pair's average payoff is one sample, which lowers the variance of the estimate.
export function runMonteCarlo(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  q: number,
  type: OptionType,
  N: number,
  steps: number,
  seed?: number
): MonteCarloResult {
  const rand = seed !== undefined ? seededRandom(seed) : Math.random;
  const dt = T / steps;
  const drift = (r - q - 0.5 * sigma * sigma) * dt;
  const diffusion = sigma * Math.sqrt(dt);
  const df = Math.exp(-r * T);
  const pairs = Math.max(1, Math.floor(N / 2));
  const payoff = (s: number) => (type === "call" ? Math.max(s - K, 0) : Math.max(K - s, 0));

  const maxPathsToStore = Math.min(2 * pairs, 200);
  const paths: number[][] = [];
  const finalPrices: number[] = [];

  let sum = 0;
  let sum2 = 0;

  for (let i = 0; i < pairs; i++) {
    let up = S;
    let down = S;
    const store = 2 * i < maxPathsToStore;
    const pathUp = store ? [S] : null;
    const pathDown = store ? [S] : null;
    for (let j = 0; j < steps; j++) {
      const z = boxMuller(rand);
      up *= Math.exp(drift + diffusion * z);
      down *= Math.exp(drift - diffusion * z);
      pathUp?.push(up);
      pathDown?.push(down);
    }
    if (pathUp && pathDown) paths.push(pathUp, pathDown);

    const x = 0.5 * (payoff(up) + payoff(down));
    sum += x;
    sum2 += x * x;
    finalPrices.push(up, down);
  }

  const mean = sum / pairs;
  const variance = Math.max(sum2 / pairs - mean * mean, 0);
  const stdError = Math.sqrt(variance / pairs) * df;

  return { price: mean * df, stdError, paths, finalPrices };
}
