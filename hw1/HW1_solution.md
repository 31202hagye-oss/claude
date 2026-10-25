# Homework Assignment 1 — Solution

Notation: two risky assets 1, 2 and a risk-free asset with return $r_f$.
$\mu_i^e=\mu_i-r_f$, $\sigma_{12}=\rho_{12}\sigma_1\sigma_2$.
Excel file: [`hw1_frontier.xlsx`](hw1_frontier.xlsx) (all cells are live formulas; inputs on the *Parameters* sheet).

> **Assumption.** The problem lists $\mu_1,\mu_2,\sigma_1,\sigma_2,\rho_{12}$ but not $r_f$.
> I use $r_f = 0.05$. Change cell `Parameters!B9` if your class used a different value; every number and chart updates.

---

## Problem 1 — Tangency portfolio

### Step 1: Unconstrained optimization

With $r_p=w_1r_1+w_2r_2$,

$$
\mu_p^e = w_1\mu_1^e + w_2\mu_2^e ,\qquad
\sigma_p^2 = w_1^2\sigma_1^2 + w_2^2\sigma_2^2 + 2w_1w_2\sigma_{12}.
$$

(If the weights do not sum to one, the leftover $1-w_1-w_2$ sits in the risk-free asset, so the excess return is still $\sum_i w_i\mu_i^e$.)

Maximize $S(w_1,w_2)=\mu_p^e/\sigma_p$. By the quotient rule,

$$
\frac{\partial S}{\partial w_i}
=\frac{\dfrac{\partial\mu_p^e}{\partial w_i}\,\sigma_p-\mu_p^e\,\dfrac{\partial\sigma_p}{\partial w_i}}{\sigma_p^2}=0
\;\Longrightarrow\;
\frac{\partial\mu_p^e}{\partial w_i}\,\sigma_p=\mu_p^e\,\frac{\partial\sigma_p}{\partial w_i}.
$$

Since $\sigma_p=\sqrt{\sigma_p^2}$, $\dfrac{\partial\sigma_p}{\partial w_i}=\dfrac{1}{2\sigma_p}\dfrac{\partial\sigma_p^2}{\partial w_i}$. Substituting and multiplying both sides by $\sigma_p$:

$$
\boxed{\;\frac{\partial\mu_p^e}{\partial w_i}\,\sigma_p^2=\mu_p^e\,\frac{1}{2}\,\frac{\partial\sigma_p^2}{\partial w_i},\qquad i=1,2.\;}
$$

Dividing the $i=1$ condition by the $i=2$ condition, the common factors $\sigma_p^2$ and $\tfrac12\mu_p^e$ cancel:

$$
\frac{\partial\mu_p^e/\partial w_1}{\partial\mu_p^e/\partial w_2}
=\frac{\partial\sigma_p^2/\partial w_1}{\partial\sigma_p^2/\partial w_2}
\quad\Longleftrightarrow\quad
\frac{\partial\mu_p^e/\partial w_1}{\partial\sigma_p^2/\partial w_1}
=\frac{\partial\mu_p^e/\partial w_2}{\partial\sigma_p^2/\partial w_2}.
$$

**Economic interpretation.** Treat expected excess return as the "good" the investor wants and variance as the "cost" (or "bad") paid for it. Each asset is an input that produces both.

* The left side is the rate at which shifting money between asset 1 and asset 2 changes expected return; the right side is the rate at which the same shift changes variance. At the optimum the two rates are equal, the same way a consumer's MRS equals the price ratio, or a firm's MRTS equals the factor-price ratio.
* The second form is the **equimarginal principle** ($MU_1/p_1 = MU_2/p_2$): the marginal expected excess return per unit of marginal variance must be the same for both assets. If asset 1 gave more extra return per unit of extra risk than asset 2, moving a little wealth from 2 to 1 would raise the Sharpe ratio, so the starting point could not be optimal.
* $\tfrac{\partial\sigma_p^2}{\partial w_i}=2\,\mathrm{Cov}(r_i,r_p)$, so the condition reads $\mu_i^e/\mathrm{Cov}(r_i,r_p)$ equal across assets. Each asset's reward is proportional to its marginal contribution to portfolio risk, which is the beta pricing relation $\mu_i^e=\beta_{ip}\,\mu_p^e$.
* $S$ is homogeneous of degree 0 in $(w_1,w_2)$ (doubling both weights leaves the Sharpe ratio unchanged). The first-order conditions therefore pin down only the **ratio** $w_1/w_2$, i.e. the direction of the ray, not its scale. That is why Step 2 is needed.

### Step 2: Impose the budget constraint

The partial derivatives are

$$
\frac{\partial\mu_p^e}{\partial w_1}=\mu_1^e,\quad
\frac{\partial\mu_p^e}{\partial w_2}=\mu_2^e,\quad
\frac{\partial\sigma_p^2}{\partial w_1}=2(w_1\sigma_1^2+w_2\sigma_{12}),\quad
\frac{\partial\sigma_p^2}{\partial w_2}=2(w_2\sigma_2^2+w_1\sigma_{12}).
$$

The ratio condition gives

$$
\frac{\mu_1^e}{\mu_2^e}=\frac{w_1\sigma_1^2+w_2\sigma_{12}}{w_2\sigma_2^2+w_1\sigma_{12}}
\;\Longrightarrow\;
\mu_1^e(w_2\sigma_2^2+w_1\sigma_{12})=\mu_2^e(w_1\sigma_1^2+w_2\sigma_{12})
$$

$$
\Longrightarrow\; w_1\left(\mu_2^e\sigma_1^2-\mu_1^e\sigma_{12}\right)=w_2\left(\mu_1^e\sigma_2^2-\mu_2^e\sigma_{12}\right).
$$

Now impose $w_1=w$, $w_2=1-w$:

$$
w\left(\mu_2^e\sigma_1^2-\mu_1^e\sigma_{12}\right)=(1-w)\left(\mu_1^e\sigma_2^2-\mu_2^e\sigma_{12}\right)
$$

$$
w\left[\mu_1^e\sigma_2^2+\mu_2^e\sigma_1^2-(\mu_1^e+\mu_2^e)\sigma_{12}\right]=\mu_1^e\sigma_2^2-\mu_2^e\sigma_{12}
$$

$$
\boxed{\,w=\frac{\mu_1^e\sigma_2^2-\mu_2^e\sigma_{12}}{\mu_1^e\sigma_2^2+\mu_2^e\sigma_1^2-(\mu_1^e+\mu_2^e)\sigma_{12}}\,}
\qquad\text{(Equation 1)}\;\blacksquare
$$

---

## Problem 2 — Numerical part ($\mu_1=0.10,\ \mu_2=0.14,\ \sigma_1=0.15,\ \sigma_2=0.20,\ \rho_{12}=0.2,\ r_f=0.05$)

| Quantity | Value |
|---|---|
| $\sigma_{12}=0.2(0.15)(0.20)$ | 0.006 |
| $\mu_1^e,\ \mu_2^e$ | 0.05, 0.09 |
| **Tangency weights** $w_1=w,\ w_2=1-w$ | **0.4584, 0.5416** |
| $\mu_p$ | 0.12166 |
| $\sigma_p^2,\ \sigma_p$ | 0.019440, 0.13943 |
| Sharpe ratio $(\mu_p-r_f)/\sigma_p$ | 0.5140 |
| GMV portfolio: $w_1,\ \mu,\ \sigma^2,\ \sigma$ | 0.6733, 0.11307, 0.017109, 0.13080 |

Calculation of $w$:
$w=\dfrac{0.05(0.04)-0.09(0.006)}{0.05(0.04)+0.09(0.0225)-0.14(0.006)}=\dfrac{0.00146}{0.003185}=0.4584$.

### (a) Mean–standard deviation frontier (sheet *Charts*, chart 1)

* **Risky assets only:** for $w_1\in[-0.5,1.5]$, $\mu_c=w_1\mu_1+(1-w_1)\mu_2$, $\sigma_c=\sqrt{w_1^2\sigma_1^2+(1-w_1)^2\sigma_2^2+2w_1(1-w_1)\sigma_{12}}$. This traces a hyperbola.
* **With the risk-free asset:** the two straight lines $\mu_c=r_f\pm SR\cdot\sigma_c$ with $SR=0.5140$. The upper line is the capital market line, tangent to the hyperbola at $p=(0.1394,\ 0.1217)$, where the portfolio holds 45.84% in asset 1 and 54.16% in asset 2.

### (b) Mean–variance frontier (chart 2)

**Risky assets only, analytic parabola.** From $\mu_c=w\mu_1+(1-w)\mu_2$, $w=\dfrac{\mu_2-\mu_c}{\mu_2-\mu_1}$ and $1-w=\dfrac{\mu_c-\mu_1}{\mu_2-\mu_1}$. Substituting into $\sigma_c^2$:

$$
\sigma_c^2=\frac{(\mu_2-\mu_c)^2\sigma_1^2+(\mu_c-\mu_1)^2\sigma_2^2+2(\mu_2-\mu_c)(\mu_c-\mu_1)\sigma_{12}}{(\mu_2-\mu_1)^2}
=\sigma^2_{GMV}+a\,(\mu_c-\mu_{GMV})^2,
$$

with $a=\dfrac{\sigma_1^2+\sigma_2^2-2\sigma_{12}}{(\mu_2-\mu_1)^2}=\dfrac{0.0505}{0.0016}=31.5625$, $\mu_{GMV}=0.11307$, $\sigma^2_{GMV}=0.017109$.
So $\sigma_c^2$ is a quadratic in $\mu_c$: a parabola opening to the right in $(\sigma^2,\mu)$ space.
On the *Frontier* sheet, column E ($\sigma^2$ from the weights) and column F (the analytic formula) agree to machine precision (column G ≈ 0). In chart 2 the dots (weight grid) sit exactly on the analytic curve.

**With the risk-free asset — derivation of Eq. (2).** From $\mu_c=r_f+w_p(\mu_p-r_f)$ we get $w_p=\dfrac{\mu_c-r_f}{\mu_p-r_f}$. From $\sigma_c^2=w_p^2\sigma_p^2$ we get $w_p=\pm\dfrac{\sqrt{\sigma_c^2}}{\sigma_p}$ (positive for a long position in $p$, negative for a short position). Equating the two:

$$
\frac{\mu_c-r_f}{\mu_p-r_f}=\pm\frac{\sqrt{\sigma_c^2}}{\sigma_p}
\;\Longrightarrow\;
\mu_c=r_f\pm\frac{\mu_p-r_f}{\sigma_p}\sqrt{\sigma_c^2}. \qquad\text{(Equation 2)}\;\blacksquare
$$

So the frontier is a square-root function of $\sigma_c^2$, not a straight line. Chart 2 shows that the orange curve $0.05+0.5140\sqrt{\sigma^2}$ passes through $p=(0.01944,\ 0.1217)$ and touches the risky parabola there, staying above it everywhere else.

### (c) Challenging question: ray vs tangent in $(\sigma^2,\mu)$ space (chart 3, sheet *Slopes*)

**(a) Slope of the ray** from $(0,r_f)$ to $(\sigma_p^2,\mu_p)$:

$$
\text{slope}_{\text{ray}}=\frac{\mu_p-r_f}{\sigma_p^2}=\frac{0.07166}{0.019440}=3.686.
$$

**(b) Tangent slope of the risky frontier at $p$.** The Eq. (2) curve is tangent to the risky frontier at $p$, so the two share a slope there. Differentiating Eq. (2), upper branch:

$$
\frac{d\mu_c}{d\sigma_c^2}=\frac{\mu_p-r_f}{\sigma_p}\cdot\frac{1}{2\sqrt{\sigma_c^2}}
\;\xrightarrow{\;\sigma_c^2=\sigma_p^2\;}\;
\frac{\mu_p-r_f}{2\sigma_p^2}=1.843.
$$

As a check, differentiating the parabola directly gives $\dfrac{d\mu}{d\sigma^2}=\dfrac{\mu_1-\mu_2}{2[w\sigma_1^2-(1-w)\sigma_2^2+(1-2w)\sigma_{12}]}=1.843$ at $w=0.4584$.

**(c) Relationship:**

$$
\text{slope}_{\text{tangent at }p}=\tfrac12\,\text{slope}_{\text{ray}}.
$$

Unlike mean–SD space, where the CML ray *is* the tangent, in mean–variance space the tangent at $p$ is exactly half as steep as the ray from $r_f$.

**(d) Using it to find $p$.** The tangency portfolio is the unique point on the efficient part of the risky frontier where the frontier's slope $d\mu/d\sigma^2$ equals one-half of the slope of the ray from $(0,r_f)$:

$$
\frac{d\mu}{d\sigma^2}\Big|_{p}=\frac12\cdot\frac{\mu_p-r_f}{\sigma_p^2}.
$$

Geometrically, the tangent line at $p$ hits the vertical axis at $\mu_p-\tfrac12(\mu_p-r_f)=\tfrac{r_f+\mu_p}{2}$, the **midpoint** between $r_f$ and $\mu_p$ (here $0.0858$). To locate $p$, move along the frontier until its tangent line crosses the $\mu$-axis halfway between $r_f$ and the point's own mean.

Note that $p$ is **not** the point that maximizes the ray slope $(\mu-r_f)/\sigma^2$. In the table below, the ray slope is still rising past $p$. Maximizing $(\mu-r_f)/\sigma^2$ is a different problem from maximizing the Sharpe ratio.

**Excel check (sheet *Slopes*):**

| $w_1$ | $\mu$ | $\sigma^2$ | Ray slope | Tangent slope | Tangent ÷ Ray |
|---|---|---|---|---|---|
| 0.00 | 0.1400 | 0.04000 | 2.250 | 0.588 | 0.261 |
| 0.20 | 0.1320 | 0.02842 | 2.885 | 0.837 | 0.290 |
| 0.40 | 0.1240 | 0.02088 | 3.544 | 1.449 | 0.409 |
| **0.4584 (p)** | **0.1217** | **0.01944** | **3.686** | **1.843** | **0.500** |
| 0.50 | 0.1200 | 0.01863 | 3.758 | 2.286 | 0.608 |
| 0.60 | 0.1160 | 0.01738 | 3.797 | 5.405 | 1.423 |
| 1.00 (inefficient) | 0.1000 | 0.02250 | 2.222 | −1.212 | −0.545 |

Among the points checked, the ratio equals exactly ½ only at the tangency portfolio. Below $p$ it is less than ½. Above $p$ it is greater than ½ and blows up near the GMV point, where the frontier becomes vertical. On the inefficient branch it is negative.
