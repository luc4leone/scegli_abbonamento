const EXTRA_DISCIPLINE_PRICE_PER_MONTH = 40;
const MIN_DISCIPLINES = 1;
const MAX_DISCIPLINES = 4;

const PLANS = [
  {
    id: "1m",
    label: "1 mese",
    months: 1,
    baseUndiscounted: 80,
    baseDiscounted: 80,
    baseSavings: 0,
    baseDiscountPct: 0,
  },
  {
    id: "3m",
    label: "3 mesi",
    months: 3,
    baseUndiscounted: 240,
    baseDiscounted: 200,
    baseSavings: 40,
    baseDiscountPct: 16,
  },
  {
    id: "6m",
    label: "6 mesi",
    months: 6,
    baseUndiscounted: 480,
    baseDiscounted: 380,
    baseSavings: 100,
    baseDiscountPct: 21,
  },
  {
    id: "12m",
    label: "12 mesi",
    months: 12,
    baseUndiscounted: 960,
    baseDiscounted: 720,
    baseSavings: 240,
    baseDiscountPct: 25,
  },
];

/** @type {null | {planId: string, disciplines: number}} */
let state = {
  planId: null,
  disciplines: 1,
};

function formatEuro(value) {
  return `${Math.round(value)}€`;
}

function computePlanTotals(plan, disciplines) {
  const extraCount = Math.max(0, disciplines - 1);
  const extrasTotal =
    extraCount * EXTRA_DISCIPLINE_PRICE_PER_MONTH * plan.months;
  const striked = plan.baseUndiscounted + extrasTotal;
  const price = plan.baseDiscounted + extrasTotal;
  const savings = plan.baseSavings;
  const discountPct =
    extraCount === 0
      ? plan.baseDiscountPct
      : striked > 0
      ? Math.round((savings / striked) * 100)
      : 0;

  return {
    extraCount,
    extrasTotal,
    striked,
    price,
    savings,
    discountPct,
  };
}

function renderPickers() {
  const optionEls = document.querySelectorAll(
    '[data-role="discipline-option"]'
  );
  optionEls.forEach((el) => {
    const value = Number(el.getAttribute("data-value"));
    const active = value === state.disciplines;
    el.setAttribute("data-active", active ? "true" : "false");
    el.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function renderExtraCounter() {
  const valueEl = document.querySelector('[data-role="extra-count"]');
  const minusBtn = document.querySelector('[data-role="extra-minus"]');
  const plusBtn = document.querySelector('[data-role="extra-plus"]');

  if (!valueEl && !minusBtn && !plusBtn) return;

  const extraCount = Math.max(0, state.disciplines - 1);

  if (valueEl) valueEl.textContent = String(extraCount);
  if (minusBtn) minusBtn.disabled = extraCount <= 0;
  if (plusBtn) plusBtn.disabled = extraCount >= 3;
}

function renderPlans() {
  const planEls = document.querySelectorAll(".plan");

  planEls.forEach((planEl) => {
    const planId = planEl.getAttribute("data-plan-id");
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) return;

    const isV3 = planEl.classList.contains("plan--v3");
    const totals = computePlanTotals(plan, state.disciplines);

    const priceEl = planEl.querySelector('[data-role="price"]');
    if (priceEl)
      priceEl.textContent = formatEuro(
        isV3 ? plan.baseDiscounted : totals.price
      );

    const totalEl = planEl.querySelector('[data-role="total"]');
    if (totalEl) totalEl.textContent = formatEuro(totals.price);

    if (isV3) {
      const extraSection = planEl.querySelector('[data-role="extra-section"]');
      const totalSection = planEl.querySelector('[data-role="total-section"]');
      const dividers = planEl.querySelectorAll('[data-role="divider"]');
      const extraVisible = totals.extraCount > 0;

      planEl.setAttribute("data-has-extra", extraVisible ? "true" : "false");

      dividers.forEach((d) => {
        d.style.display = extraVisible ? "block" : "none";
      });

      if (extraSection)
        extraSection.style.display = extraVisible ? "block" : "none";
      if (totalSection)
        totalSection.style.display = extraVisible ? "block" : "none";

      if (extraVisible) {
        const extraLabelEl = planEl.querySelector('[data-role="extra-label"]');
        const extraPriceEl = planEl.querySelector('[data-role="extra-price"]');
        const extraMultEl = planEl.querySelector('[data-role="extra-mult"]');

        if (extraLabelEl) {
          extraLabelEl.textContent =
            totals.extraCount === 1
              ? "1 disciplina extra +40€/mese"
              : `${totals.extraCount} discipline extra +40€/mese`;
        }
        if (extraPriceEl)
          extraPriceEl.textContent = formatEuro(totals.extrasTotal);
        if (extraMultEl) {
          extraMultEl.textContent =
            plan.months === 1 ? "x 1 mese" : `x ${plan.months} mesi`;
        }
      }
    }

    const strikedEl = planEl.querySelector('[data-role="striked"]');
    if (strikedEl) {
      strikedEl.textContent = formatEuro(
        isV3 ? plan.baseUndiscounted : totals.striked
      );
      strikedEl.style.display =
        plan.baseUndiscounted === plan.baseDiscounted ? "none" : "block";
    }

    const savingsEl = planEl.querySelector('[data-role="savings"]');
    if (savingsEl) {
      savingsEl.textContent = `Risparmi ${formatEuro(totals.savings)}`;
      savingsEl.style.display =
        plan.baseUndiscounted === plan.baseDiscounted ? "none" : "block";
    }

    const discountEl = planEl.querySelector('[data-role="discount"]');
    if (discountEl) {
      const baseDiscountPct =
        plan.baseUndiscounted > 0
          ? Math.round((plan.baseSavings / plan.baseUndiscounted) * 100)
          : 0;
      discountEl.textContent = `Sconto ${
        isV3 ? baseDiscountPct : totals.discountPct
      }%`;
      discountEl.style.display =
        plan.baseUndiscounted === plan.baseDiscounted ? "none" : "block";
    }

    const isSelected = state.planId === planId;
    planEl.setAttribute("data-selected", isSelected ? "true" : "false");

    const selectBtn = planEl.querySelector('[data-role="select"]');
    if (selectBtn) selectBtn.disabled = isSelected;
  });

  const checkoutBtn = document.querySelector('[data-role="checkout"]');
  if (checkoutBtn) checkoutBtn.disabled = state.planId === null;
}

function renderCounter() {
  const valueEl = document.querySelector('[data-role="disciplines"]');
  if (valueEl) valueEl.textContent = String(state.disciplines);

  const minusBtn = document.querySelector('[data-role="minus"]');
  const plusBtn = document.querySelector('[data-role="plus"]');

  if (minusBtn) minusBtn.disabled = state.disciplines <= MIN_DISCIPLINES;
  if (plusBtn) plusBtn.disabled = state.disciplines >= MAX_DISCIPLINES;
}

function render() {
  renderCounter();
  renderPickers();
  renderExtraCounter();
  renderPlans();
}

function onSelectPlan(planId) {
  state = {
    ...state,
    planId,
  };
  render();
}

function onSetDisciplines(value) {
  const next = Math.min(MAX_DISCIPLINES, Math.max(MIN_DISCIPLINES, value));
  if (next === state.disciplines) return;

  state = {
    ...state,
    disciplines: next,
  };
  render();
}

function onBuy(planId) {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) return;

  const totals = computePlanTotals(plan, state.disciplines);
  const lines = [
    `Abbonamento: ${plan.label}`,
    `Discipline totali: ${state.disciplines}`,
    `Discipline extra: ${totals.extraCount}`,
    `Totale: ${formatEuro(totals.price)}`,
  ];

  alert(lines.join("\n"));
}

function onChangeDisciplines(delta) {
  const next = Math.min(
    MAX_DISCIPLINES,
    Math.max(MIN_DISCIPLINES, state.disciplines + delta)
  );
  if (next === state.disciplines) return;

  state = {
    ...state,
    disciplines: next,
  };
  render();
}

function onCheckout() {
  if (!state.planId) return;

  const plan = PLANS.find((p) => p.id === state.planId);
  if (!plan) return;

  const totals = computePlanTotals(plan, state.disciplines);

  const lines = [
    `Abbonamento: ${plan.label}`,
    `Discipline totali: ${state.disciplines}`,
    `Discipline extra: ${totals.extraCount}`,
    `Totale: ${formatEuro(totals.price)}`,
  ];

  alert(lines.join("\n"));
}

function bindEvents() {
  const planEls = document.querySelectorAll(".plan");
  planEls.forEach((planEl) => {
    const planId = planEl.getAttribute("data-plan-id");
    const btn = planEl.querySelector('[data-role="select"]');
    if (!btn || !planId) return;

    btn.addEventListener("click", () => onSelectPlan(planId));
  });

  const minusBtn = document.querySelector('[data-role="minus"]');
  const plusBtn = document.querySelector('[data-role="plus"]');
  const checkoutBtn = document.querySelector('[data-role="checkout"]');

  const extraMinusBtn = document.querySelector('[data-role="extra-minus"]');
  const extraPlusBtn = document.querySelector('[data-role="extra-plus"]');

  const disciplineOptionBtns = document.querySelectorAll(
    '[data-role="discipline-option"]'
  );
  const buyBtns = document.querySelectorAll('[data-role="buy"]');

  if (minusBtn)
    minusBtn.addEventListener("click", () => onChangeDisciplines(-1));
  if (plusBtn) plusBtn.addEventListener("click", () => onChangeDisciplines(1));
  if (checkoutBtn) checkoutBtn.addEventListener("click", onCheckout);

  if (extraMinusBtn)
    extraMinusBtn.addEventListener("click", () => onChangeDisciplines(-1));
  if (extraPlusBtn)
    extraPlusBtn.addEventListener("click", () => onChangeDisciplines(1));

  disciplineOptionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = Number(btn.getAttribute("data-value"));
      onSetDisciplines(value);
    });
  });

  buyBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const planEl = btn.closest(".plan");
      const planId = planEl?.getAttribute("data-plan-id");
      if (!planId) return;
      onBuy(planId);
    });
  });
}

bindEvents();
render();
