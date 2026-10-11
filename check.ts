// Self-check against textbook values (Hull: S=100, K=100, T=1, r=5%, σ=20%). Run: npm run check
import { normalCDF, blackScholes } from "./src/pricing";
import { computeGreeks } from "./src/greeks";
import { impliedVol } from "./src/impliedVol";
import { runMonteCarlo } from "./src/monteCarlo";

const near = (got: number, want: number, tol: number, what: string) => {
  if (!(Math.abs(got - want) <= tol)) throw new Error(`${what}: got ${got}, want ${want} ± ${tol}`);
  console.log(`ok  ${what} = ${got.toFixed(6)}`);
};

near(normalCDF(0), 0.5, 1e-7, "N(0)");
near(normalCDF(1), 0.841345, 1e-6, "N(1)");
near(normalCDF(-1.96), 0.024998, 1e-6, "N(-1.96)");

const call = blackScholes(100, 100, 1, 0.05, 0.2, 0, "call").price;
const put = blackScholes(100, 100, 1, 0.05, 0.2, 0, "put").price;
near(call, 10.450584, 1e-4, "BS call");
near(put, 5.573526, 1e-4, "BS put");
const cq = blackScholes(100, 95, 0.5, 0.03, 0.25, 0.02, "call").price;
const pq = blackScholes(100, 95, 0.5, 0.03, 0.25, 0.02, "put").price;
near(cq - pq, 100 * Math.exp(-0.02 * 0.5) - 95 * Math.exp(-0.03 * 0.5), 1e-6, "put-call parity (q>0)");

const g = computeGreeks(100, 100, 1, 0.05, 0.2, 0, "call");
near(g.delta, 0.636831, 1e-5, "delta");
near(g.gamma, 0.018762, 1e-5, "gamma");
near(g.vega / 100, 0.375240, 1e-5, "vega per 1%");
near(g.theta, -6.414028 / 365, 1e-5, "theta per day");
near(g.rho, 0.532325, 1e-5, "rho per 1%");

near(impliedVol(call, 100, 100, 1, 0.05, 0, "call") ?? NaN, 0.2, 1e-6, "implied vol round-trip");

const mc = runMonteCarlo(100, 100, 1, 0.05, 0.2, 0, "call", 200000, 1, 42);
near(mc.price, call, 3 * mc.stdError, `MC call (SE ${mc.stdError.toFixed(4)})`);
