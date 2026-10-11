# OPT — Option Pricing Terminal

A browser-based pricer for European options: closed-form Black-Scholes-Merton, a Monte Carlo cross-check, the Greeks and implied volatility.

**Live demo:** https://derka1385.github.io/OPT-option-pricing-terminal/

> Educational project. Not investment advice.

## Models

### Black-Scholes-Merton (1973), with continuous dividend yield

- Call: `C = S·e^(-qT)·N(d1) - K·e^(-rT)·N(d2)`
- Put: `P = K·e^(-rT)·N(-d2) - S·e^(-qT)·N(-d1)`
- `d1 = [ln(S/K) + (r - q + ½σ²)T] / (σ√T)`, `d2 = d1 - σ√T`

### Monte Carlo (GBM under the risk-neutral measure)

`S(t+dt) = S(t) · exp[(r - q - ½σ²)dt + σ√dt · Z]`

- Antithetic variates: every draw Z also drives a mirror path with -Z, which reduces the variance of the estimate.
- Reports the price with a 95% confidence interval (±1.96 standard errors), so it can be checked against the closed-form price.
- Optional seed for reproducible runs.

### Greeks

Delta, gamma, theta (per day), vega (per 1 vol point) and rho (per 1% rate), in closed form.

### Implied volatility

Bisection for a robust bracket, then Newton-Raphson (using vega) for fast refinement.

## Validation

`npm run check` tests the engine against textbook values (S = 100, K = 100, T = 1, r = 5%, σ = 20%):

| Quantity | Expected | Engine |
|---|---|---|
| Call price | 10.4506 | 10.4506 |
| Put price | 5.5735 | 5.5735 |
| Delta / Gamma | 0.6368 / 0.0188 | 0.6368 / 0.0188 |
| Implied vol round-trip | 20.00% | 20.00% |
| Monte Carlo (200,000 paths) | within 3 standard errors | 10.4494 ± 0.0231 |

It also checks put-call parity with a dividend yield.

## Assumptions and limitations

- Frictionless market, constant rate and volatility, log-normal returns, European exercise only.
- No volatility smile or surface, no jumps (Merton 1976), no stochastic volatility (Heston, SABR).
- American options are not supported.

## Run locally

```bash
npm install
npm run dev     # local server
npm run check   # validation tests
npm run build   # static site in docs/ (served by GitHub Pages)
```

## Stack

TypeScript and Vite. Charts are drawn directly on HTML canvas; the pricing engine has no external dependencies.

## Author

Nolann Petri, BSc Business & Economics, Stockholm School of Economics.
