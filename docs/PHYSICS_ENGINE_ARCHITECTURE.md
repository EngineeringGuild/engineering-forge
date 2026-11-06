# Architecture & Evolution Plan: Real Physics Engine Matrix (Engineering Forge)
**Author**: Engineering Guild Technical Drafting & Simulation Division  
**Guild Leadership**: Caio Castilho (CEO / President), Claude (Chief CTO), Gemini (Guild CGO / Industrial Technical Drafter)  
**Standard Compliance**: ASME BPVC Section III / Section VIII Div 1 & 2, ASTM E8/E8M-21, ISO 80000-1:2022, ISO 80000-4:2019, IEEE/IEC 60027  
**Version**: v1.0.0 (Evolutionary Baseline to v3.0 Matrix)  
**Status**: ACTIVE ARCHITECTURE SPECIFICATION  

---

## 1. Executive Summary & Foundational Vision

Engineering Forge is designed to transform players—young learners and aspiring builders—into real engineers by grounding all mechanics in authentic physical laws rather than arbitrary game approximations.

The **Real Physics Engine Matrix** forms the structural, mechanical, and electrodynamic core of the application. It serves not only the immediate gameplay loops (Trusses & Bridges, Vehicles & Powertrains, Electromechanical Circuits & Logic), but is architected as a modular, decoupled, and reusable computational matrix for cross-Guild simulation pipelines.

---

## 2. Real Engineering Standards Baseline

Every formulation, metric, and threshold in the matrix adheres strictly to international engineering design codes:

| Domain | Standard & Clause | Physical Quantity & Engineering Application |
| :--- | :--- | :--- |
| **Tensile & Compressive Strength** | **ASTM E8/E8M-21** (Clause 7.7) | Uniaxial tensile testing, yield strength $R_{eH}$, ultimate tensile strength $R_m$, and elongation at fracture $A$ |
| **Allowable Stress & Safety Factor** | **ASME BPVC Section VIII, Div 1** (Part UG-23) | Maximum allowable stress values $S = \min\left(\frac{2}{3} S_y, \frac{1}{3.5} S_u\right)$, Safety Margin $SF \ge 1.5$ |
| **Elastic Modulus & Hooke's Law** | **ASTM E111-17** | Modulus of Elasticity (Young's Modulus $E$), proportional limit, axial stiffness $k = \frac{E \cdot A}{L_0}$ |
| **Euler Column Buckling** | **AISC 360-16** (Chapter E) & **ASME III** | Critical buckling load $P_{cr} = \frac{\pi^2 E I}{(K L)^2}$ for compression members |
| **SI Quantities and Units** | **ISO 80000-1:2022** & **ISO 80000-4:2019** | Base SI units ($m, kg, s, A, K$), derived units ($N = kg \cdot m/s^2$, $Pa = N/m^2$, $J = N \cdot m$, $W = J/s$) |
| **Electrodynamics & DC Networks** | **IEEE Std 100** / **IEC 60027-1** | Kirchhoff's Current Law ($\sum I = 0$), Kirchhoff's Voltage Law ($\sum V = 0$), Joule Heating ($P = I^2 R$) |

---

## 3. Evolutionary Versioning Roadmap: v1.0 $\to$ v2.0 $\to$ v3.0

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PHYSICS ENGINE MATRIX                          │
├──────────────────┬──────────────────────┬──────────────────────────────┤
│  v1.0 (BASELINE) │    v2.0 (EXPANSION)  │     v3.0 (GUILD MATRIX)      │
│  Rigid-Body 2D   │ Continuum Mechanics  │ Multi-Physics Coupling       │
│  Matter.js + FEM │ Nonlinear Plasticity │ Real-Time FEA / FSI          │
└──────────────────┴──────────────────────┴──────────────────────────────┘
```

### Version 1.0 — Current Operational Baseline (Delivered)
- **Direct Stiffness Method (Truss 2D)**: Solves static node equilibrium $[K] \{u\} = \{F\}$ using global stiffness assembly:
  $$[K_e] = \frac{E A}{L} \begin{bmatrix} c^2 & cs & -c^2 & -cs \\ cs & s^2 & -cs & -s^2 \\ -c^2 & -cs & c^2 & cs \\ -cs & -s^2 & cs & s^2 \end{bmatrix}$$
  where $c = \cos\theta, s = \sin\theta$.
- **Matter.js Multi-Body Rigid Dynamics**:
  - Continuous collision detection with terrain and abutment boundaries.
  - Vehicle suspension dynamics (chassis mass, spring-damper axle constraints, wheel normal forces, rolling resistance).
  - Physical constraint breaking when member axial stress exceeds allowable yield:
    $$\sigma_{axial} = \frac{|F_{axial}|}{A} > \sigma_{allow} \implies \text{Composite.remove}(world, constraint)$$
- **Electromechanical Switched Circuits**:
  - DC network nodal analysis with Matter.js physical lever contact and overcurrent breaker tripping.
- **Real-Time Instrumentation & Inspection**:
  - 6-stop scientific stress heatmap (Blue $0\% \to$ Cyan $25\% \to$ Green $50\% \to$ Amber $75\% \to$ Orange $90\% \to$ Red $100\%$ Yield Failure).
  - Active opposing force vector rendering with magnitude badges ($kN$) and $(T)$ tension / $(C)$ compression tags.
  - Interactive playback control panel (Play, Pause, 0.5x Slow-Mo, 1x, 2x, 4x, Reset Bodies, Timeline Scrubber).

---

### Version 2.0 — Continuum Mechanics & Nonlinear Structural Dynamics (Delivered & Certified)
- **Euler-Bernoulli Elastic Beam Flexure (Delivered)**:
  - Simple beam bending under concentrated and self-mass distributed loads:
    $$\delta_{max} = \frac{P L^3}{48 E I}, \quad M_{max} = \frac{P L}{4}, \quad \sigma_{max} = \frac{M c}{I}$$
- **Euler Critical Column Buckling (AISC 360-16 / ASME III) (Delivered)**:
  - Critical buckling load $P_{cr} = \frac{\pi^2 E I}{(K L)^2}$ and slenderness ratio $\lambda = \frac{K L}{r}$. Compression members undergo physical lateral buckling failure when $|F_{axial}| > P_{cr}$, prior to material yield.
- **Pacejka Magic Formula Tire Dynamics (Delivered)**:
  - Longitudinal tire traction curves $F_x(\kappa)$ modeling rolling resistance, optimal grip at 12–18% slip, and wheelspin burnout.
- **Interactive Multi-Mode Material Test Bench (`/lab`) (Delivered)**:
  - Beam Bending Mode, Euler Buckling Mode, and Pacejka Tire Slip Mode with interactive parametric sliders and SVG curve plots.
- **PhysicsMediator & PhysicsPerformanceMonitor (Delivered)**:
  - Reactive decoupled state mediator with frame-by-frame calculation timing and CPU load telemetry graph.

---

### Version 3.0 — Coupled Multi-Physics Guild Matrix (Active Implementation)
- **Electro-Thermal-Structural Coupling (Active)**:
  - Electrical current flow $I$ through structural elements generates Joule dissipation $\dot{Q} = I^2 R = I^2 (\rho_e \frac{L}{A})$.
  - Thermal mass temperature rise $\Delta T = \frac{\dot{Q} \Delta t}{m c_p}$.
  - Constrained thermal expansion induces thermal pre-stress:
    $$\sigma_{th} = E (\epsilon - \alpha_{th} \Delta T), \quad \sigma_{comb} = \frac{|F_{axial}|}{A} + \sigma_{th}$$
  - Evaluated via `evaluateElectroThermalStructuralCoupling(...)` in `PhysicsEngineRegistry`.
- **Fluid-Structure Interaction (FSI) & Aerodynamics (Active)**:
  - Dynamic air pressure $q = \frac{1}{2} \rho v^2$.
  - Quadratic aerodynamic drag $F_d = q C_d A_{ref}$ and downforce/lift $F_L = q C_L A_{ref}$.
  - Lateral aerodynamic bridge cross-wind thrust loading on exposed truss frames:
    $$F_{wind} = \frac{1}{2} \rho v_{wind}^2 C_{d,truss} A_{exposed}$$
  - Evaluated via `evaluateFluidStructureInteraction(...)` in `PhysicsEngineRegistry`.
- **Dimension Register & CAD Export (Active)**:
  - Full parametric export into Guild engineering formats (`exportToGuildRegister`), supporting dimension logs, named tuples, and technical drawing manifests.

---

## 4. Verification Gates & Tolerances Matrix

| Gate ID | Standard Verification Criterion | Pass/Fail Acceptance Boundary |
| :--- | :--- | :--- |
| **G-PHYS-01** | Global Equilibrium $\sum F_x = 0, \sum F_y = 0$ | $|\sum R_y - W_{total}| < 10^{-3} W_{total}$ |
| **G-PHYS-02** | Hooke's Law Linearity $\Delta L = \frac{F L}{E A}$ | Relative error $< 0.1\%$ in elastic regime |
| **G-PHYS-03** | Energy Conservation $\Delta E_{mech} = W_{friction} + W_{damping}$ | Energy drift $< 0.5\%$ per simulation second |
| **G-PHYS-04** | Matter.js Body Reset Repeatability | Positional deviation $\Delta x = 0.000$, $\Delta v = 0.000$ |
| **G-PHYS-05** | Heatmap Contour Monotonicity | Continuous gradient smoothly maps $0 \to 1$ without discontinuity |
| **G-PHYS-06** | Voltage Law $\sum V_{loop} = 0$, Current Law $\sum I_{node} = 0$ | Kirchhoff nodal current residue $< 10^{-6}$ A |

---

## 5. Architectural Directory Layout

```
game/src/physics/
├── materials.ts             # ASTM/ISO material constitutive properties (E, density, yield)
├── linalg.ts                # Dense linear solver (Gaussian elimination with partial pivoting)
├── truss.ts                 # Static truss equilibrium solver & member capacity
├── trussDynamic.ts          # Moving-load trajectory solver & displacement interpolation
├── matterTruss.ts           # Matter.js dynamic bridge simulation & fracture constraints
├── matterVehicle.ts         # Matter.js powertrain, normal force, tire traction limits
├── matterCircuit.ts         # DC nodal circuit & electromechanical contact dynamics
├── heatmap.ts               # Scientific 6-stop stress heatmap & safety factor calculations
└── tests/
    ├── truss.test.ts
    ├── trussDynamic.test.ts
    ├── matterPhysics.test.ts
    ├── vehicle.test.ts
    ├── circuit.test.ts
    └── heatmap.test.ts
```

---
*Signed by Direction of the Engineering Guild — Caio Castilho, CEO & President.*
