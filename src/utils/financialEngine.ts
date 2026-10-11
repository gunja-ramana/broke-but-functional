import type {
  Transaction,
  Commitment,
  SavingsGoal,
  FinancialSummary,
  HealthBreakdown,
  RiskLevel,
  HealthGrade,
  SimulationScenario,
  SimulationComparison,
  ForecastDay,
  ActionMove,
} from '../types/financial';

export const BASELINE_MONTHLY_BUDGET = 10000;
export const TOTAL_MONTH_DAYS = 30;

/**
 * Calculates complete financial summary from transactions, commitments, and savings.
 */
export function calculateFinancialSummary(
  transactions: Transaction[],
  commitments: Commitment[],
  savingsGoals: SavingsGoal[],
  options?: {
    startingBudget?: number;
    currentDay?: number;
    totalDays?: number;
  }
): FinancialSummary {
  const startingBudget = options?.startingBudget ?? BASELINE_MONTHLY_BUDGET;
  const currentDay = Math.min(TOTAL_MONTH_DAYS, Math.max(1, options?.currentDay ?? 12));
  const totalDays = options?.totalDays ?? TOTAL_MONTH_DAYS;
  const daysRemaining = Math.max(0, totalDays - currentDay);

  // Income & Expenses
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const t of transactions) {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else {
      totalExpenses += t.amount;
    }
  }

  // Current Cash in Hand
  const currentCashBalance = startingBudget + totalIncome - totalExpenses;

  // Commitments
  let outstandingCommitments = 0;
  let paidCommitments = 0;
  let upcomingSubscriptions = 0;

  for (const c of commitments) {
    if (c.isPaid) {
      paidCommitments += c.amount;
    } else {
      outstandingCommitments += c.amount;
      if (c.type === 'subscription') {
        upcomingSubscriptions += c.amount;
      }
    }
  }

  // Protected Savings
  const protectedSavings = savingsGoals.reduce((sum, g) => sum + Math.max(0, g.currentAmount), 0);

  // Spendable Balance = Cash Balance - Unpaid Commitments - Protected Savings
  // Never double subtract: paid commitments are already inside totalExpenses, so they are not in outstandingCommitments.
  const spendableBalance = currentCashBalance - outstandingCommitments - protectedSavings;

  // Recommended Daily Allowance
  let recommendedDailyAllowance = 0;
  if (daysRemaining <= 0) {
    recommendedDailyAllowance = Math.max(0, Math.round(spendableBalance));
  } else {
    recommendedDailyAllowance = Math.max(0, Math.floor(spendableBalance / daysRemaining));
  }

  // Burn Rate & Discretionary Velocity
  const daysPassed = Math.max(1, currentDay);
  const averageDailySpend = Math.round(totalExpenses / daysPassed);
  const idealDailyBudget = Math.round(startingBudget / totalDays); // ~₹333/day
  const burnRateRatio = idealDailyBudget > 0 ? averageDailySpend / idealDailyBudget : 1;

  // Projected Month-End Balance based on current spend pace and commitments
  // If user continues discretionary burn at averageDailySpend:
  const projectedDiscretionaryFuture = averageDailySpend * daysRemaining;
  const projectedMonthEndBalance = Math.round(
    currentCashBalance - outstandingCommitments - projectedDiscretionaryFuture
  );

  // Health and Risk
  const health = calculateFinancialHealth({
    spendableBalance,
    currentCashBalance,
    outstandingCommitments,
    protectedSavings,
    daysRemaining,
    recommendedDailyAllowance,
    averageDailySpend,
    startingBudget,
    projectedMonthEndBalance,
  });

  return {
    startingBudget,
    currentDay,
    totalDays,
    daysRemaining,
    totalIncome,
    totalExpenses,
    currentCashBalance,
    outstandingCommitments,
    paidCommitments,
    upcomingSubscriptions,
    protectedSavings,
    spendableBalance,
    recommendedDailyAllowance,
    projectedMonthEndBalance,
    averageDailySpend,
    burnRateRatio,
    health,
  };
}

/**
 * Transparent, deterministic heuristic for financial health and risk.
 */
export function calculateFinancialHealth(params: {
  spendableBalance: number;
  currentCashBalance: number;
  outstandingCommitments: number;
  protectedSavings: number;
  daysRemaining: number;
  recommendedDailyAllowance: number;
  averageDailySpend: number;
  startingBudget: number;
  projectedMonthEndBalance: number;
}): HealthBreakdown {
  const {
    spendableBalance,
    currentCashBalance,
    outstandingCommitments,
    protectedSavings,
    recommendedDailyAllowance,
    startingBudget,
    projectedMonthEndBalance,
  } = params;

  const insights: string[] = [];

  // Pillar 1: Runway & Daily Allowance Viability (Max 35 pts)
  // Baseline benchmark is ₹333/day (₹10,000 / 30)
  let runwayScore = 0;
  if (spendableBalance <= 0) {
    runwayScore = 0;
    insights.push('Spendable balance is depleted or negative. High risk of overspending.');
  } else if (recommendedDailyAllowance >= 350) {
    runwayScore = 35;
    insights.push(`Healthy daily allowance of ₹${recommendedDailyAllowance}/day gives strong breathing room.`);
  } else if (recommendedDailyAllowance >= 250) {
    runwayScore = 28;
    insights.push(`Daily allowance is sustainable at ₹${recommendedDailyAllowance}/day with disciplined spending.`);
  } else if (recommendedDailyAllowance >= 150) {
    runwayScore = 18;
    insights.push(`Tight daily allowance of ₹${recommendedDailyAllowance}/day. Avoid discretionary splurges.`);
  } else {
    runwayScore = 8;
    insights.push(`Critically low daily allowance (₹${recommendedDailyAllowance}/day). Essential expenses only.`);
  }

  // Pillar 2: Commitment Coverage (Max 25 pts)
  let commitmentCoverageScore = 0;
  if (outstandingCommitments === 0) {
    commitmentCoverageScore = 25;
    insights.push('All scheduled commitments are covered or paid in full.');
  } else if (currentCashBalance >= outstandingCommitments * 1.5) {
    commitmentCoverageScore = 25;
    insights.push('Cash reserves comfortably cover all remaining commitments.');
  } else if (currentCashBalance >= outstandingCommitments) {
    const ratio = currentCashBalance / (outstandingCommitments || 1);
    commitmentCoverageScore = Math.min(24, Math.round(18 + (ratio - 1) * 12));
    insights.push('Upcoming commitments can be covered, but cash will be tight afterwards.');
  } else {
    // Cannot cover commitments!
    const ratio = Math.max(0, currentCashBalance / (outstandingCommitments || 1));
    commitmentCoverageScore = Math.max(0, Math.round(ratio * 12));
    insights.push(`WARNING: Cash balance (₹${currentCashBalance}) is insufficient for ₹${outstandingCommitments} in upcoming bills.`);
  }

  // Pillar 3: Savings Discipline / Cushion (Max 20 pts)
  // 10% of starting budget (₹1,000) is the benchmark goal for Gen Z survival
  let savingsDisciplineScore = 0;
  const savingsTargetBenchmark = startingBudget * 0.1; // ₹1,000
  if (protectedSavings >= savingsTargetBenchmark) {
    savingsDisciplineScore = 20;
    insights.push(`Great emergency cushion: ₹${protectedSavings} safely ring-fenced.`);
  } else if (protectedSavings > 0) {
    savingsDisciplineScore = Math.min(19, Math.round((protectedSavings / savingsTargetBenchmark) * 20));
    insights.push(`Partial emergency cushion: ₹${protectedSavings} saved so far.`);
  } else {
    savingsDisciplineScore = 0;
    insights.push('Zero savings ring-fenced. You have no buffer against unexpected emergencies.');
  }

  // Pillar 4: Burn Rate & Projected Month-End Discipline (Max 20 pts)
  let burnRateDisciplineScore = 0;
  const surplusTarget = startingBudget * 0.15; // Benchmark: 15% surplus (₹1,500 on ₹10k)
  const bufferTarget = startingBudget * 0.05;  // Benchmark: 5% buffer (₹500 on ₹10k)
  const deficitScale = Math.max(1, startingBudget * 0.02); // Scales deficit severity (200 on ₹10k)

  if (projectedMonthEndBalance >= surplusTarget) {
    burnRateDisciplineScore = 20;
    insights.push(`Projected to finish the month with ₹${projectedMonthEndBalance} surplus.`);
  } else if (projectedMonthEndBalance >= bufferTarget) {
    burnRateDisciplineScore = 16;
    insights.push(`Projected month-end cash is positive at ₹${projectedMonthEndBalance}.`);
  } else if (projectedMonthEndBalance >= 0) {
    burnRateDisciplineScore = 10;
    insights.push('Projected month-end balance is near zero. Edge-of-seat survival.');
  } else {
    burnRateDisciplineScore = Math.max(0, Math.round(10 - Math.min(10, Math.abs(projectedMonthEndBalance) / deficitScale)));
    insights.push(`DEFICIT WARNING: Projected to end the month ₹${Math.abs(projectedMonthEndBalance)} in the red!`);
  }

  const rawScore = runwayScore + commitmentCoverageScore + savingsDisciplineScore + burnRateDisciplineScore;
  const score = Math.max(0, Math.min(100, rawScore));

  let grade: HealthGrade = 'Healthy';
  let riskLevel: RiskLevel = 'Moderate';

  if (spendableBalance < 0 || currentCashBalance < outstandingCommitments || projectedMonthEndBalance < -500) {
    riskLevel = 'Critical';
    grade = 'Critical';
  } else if (score >= 80) {
    grade = 'Excellent';
    riskLevel = 'Low';
  } else if (score >= 65) {
    grade = 'Healthy';
    riskLevel = 'Low';
  } else if (score >= 48) {
    grade = 'Fragile';
    riskLevel = 'Moderate';
  } else if (score >= 30) {
    grade = 'High Risk';
    riskLevel = 'High';
  } else {
    grade = 'Critical';
    riskLevel = 'Critical';
  }

  return {
    score,
    grade,
    riskLevel,
    runwayScore,
    commitmentCoverageScore,
    savingsDisciplineScore,
    burnRateDisciplineScore,
    insights,
  };
}

/**
 * Calculates the first future day number (currentDay..30) where running cash drops below zero.
 * Returns null if cash remains >= 0 through Day 30 (safe through the month).
 */
export function calculateDepletionDay(
  forecast: ForecastDay[],
  currentDay: number
): number | null {
  for (const day of forecast) {
    if (day.dayNumber >= currentDay && day.cashBalance < 0) {
      return day.dayNumber;
    }
  }
  return null;
}

/**
 * Simulates a proposed financial decision without mutating existing data.
 */
export function simulateDecision(
  currentTransactions: Transaction[],
  currentCommitments: Commitment[],
  currentSavings: SavingsGoal[],
  scenario: SimulationScenario,
  options?: { startingBudget?: number; currentDay?: number; totalDays?: number }
): SimulationComparison {
  const currentSummary = calculateFinancialSummary(
    currentTransactions,
    currentCommitments,
    currentSavings,
    options
  );

  // Clone arrays
  const simTransactions = [...currentTransactions];
  const simCommitments = [...currentCommitments];
  const simSavings = currentSavings.map((s) => ({ ...s }));

  const now = Date.now();
  const currentDayNum = Math.min(
    options?.totalDays ?? TOTAL_MONTH_DAYS,
    Math.max(1, options?.currentDay ?? 12)
  );
  const todayStr = `2026-10-${currentDayNum.toString().padStart(2, '0')}`;

  if (scenario.type === 'income') {
    simTransactions.push({
      id: `sim-${now}`,
      description: scenario.description || 'Simulated Income',
      amount: scenario.amount,
      type: 'income',
      category: 'Other',
      date: todayStr,
      createdAt: now,
      isSimulated: true,
    });
  } else if (scenario.type === 'subscription' || scenario.type === 'bill') {
    // If it's a future commitment
    simCommitments.push({
      id: `sim-${now}`,
      name: scenario.description || 'Simulated Commitment',
      amount: scenario.amount,
      dueDate: todayStr,
      category: scenario.category,
      isPaid: false,
      type: scenario.type === 'subscription' ? 'subscription' : 'one-time',
      recurrence: scenario.recurrence ?? (scenario.type === 'subscription' ? 'monthly' : undefined),
    });
  } else if (scenario.type === 'savings_deposit') {
    // Increases first savings goal or adds to protected savings
    if (simSavings.length > 0) {
      simSavings[0] = {
        ...simSavings[0],
        currentAmount: simSavings[0].currentAmount + scenario.amount,
      };
    } else {
      simSavings.push({
        id: `sim-${now}`,
        name: 'Simulated Savings',
        targetAmount: scenario.amount * 2,
        currentAmount: scenario.amount,
        createdAt: now,
      });
    }
  } else {
    // Direct expense: purchase, food, unexpected, etc.
    simTransactions.push({
      id: `sim-${now}`,
      description: scenario.description || 'Simulated Expense',
      amount: scenario.amount,
      type: 'expense',
      category: scenario.category,
      date: todayStr,
      createdAt: now,
      isSimulated: true,
    });
  }

  const simulatedSummary = calculateFinancialSummary(
    simTransactions,
    simCommitments,
    simSavings,
    options
  );

  const deltaSpendable = simulatedSummary.spendableBalance - currentSummary.spendableBalance;
  const deltaDailyAllowance =
    simulatedSummary.recommendedDailyAllowance - currentSummary.recommendedDailyAllowance;
  const deltaProjectedMonthEnd =
    simulatedSummary.projectedMonthEndBalance - currentSummary.projectedMonthEndBalance;
  const deltaHealthScore = simulatedSummary.health.score - currentSummary.health.score;

  const warnings: string[] = [];
  const isAffordable = simulatedSummary.spendableBalance >= 0;
  const shortfall = isAffordable ? 0 : Math.abs(simulatedSummary.spendableBalance);

  if (!isAffordable) {
    warnings.push(
      `This decision exceeds your spendable balance by ₹${shortfall}. You will be unable to pay scheduled commitments without dipping into protected savings.`
    );
  }

  if (deltaDailyAllowance < -30) {
    warnings.push(
      `This purchase reduces your daily allowance by ₹${Math.abs(deltaDailyAllowance)}/day for the remaining ${currentSummary.daysRemaining} days.`
    );
  }

  if (scenario.type === 'subscription') {
    warnings.push(
      `This recurring subscription adds an ongoing liability of ₹${scenario.amount} every month.`
    );
  }

  if (simulatedSummary.health.riskLevel === 'Critical' && currentSummary.health.riskLevel !== 'Critical') {
    warnings.push('CRITICAL RISK TRIGGERED: This decision pushes your financial status into the Critical danger zone.');
  }

  let recommendation = '';
  if (isAffordable) {
    if (scenario.type === 'income') {
      recommendation = `Applying this income will increase your daily spending cushion by +₹${Math.abs(deltaDailyAllowance)}/day.`;
    } else if (deltaDailyAllowance > -15) {
      recommendation = `Safe to spend. The impact on your daily budget is minor (-₹${Math.abs(deltaDailyAllowance)}/day).`;
    } else {
      recommendation = `Proceed with caution. You'll need to limit daily spending to ₹${simulatedSummary.recommendedDailyAllowance} to stay on track.`;
    }
  } else {
    recommendation = `Not recommended. You face a ₹${shortfall} shortfall. Consider deferring this expense or reducing optional spending.`;
  }

  const deltaProtectedSavings =
    simulatedSummary.protectedSavings - currentSummary.protectedSavings;

  const beforeForecast = generate30DayForecast(
    currentTransactions,
    currentCommitments,
    currentSavings,
    options
  );
  const beforeDepletion = calculateDepletionDay(beforeForecast, currentSummary.currentDay);

  const afterForecast = generate30DayForecast(
    simTransactions,
    simCommitments,
    simSavings,
    options
  );
  const afterDepletion = calculateDepletionDay(afterForecast, simulatedSummary.currentDay);

  return {
    before: {
      spendableBalance: currentSummary.spendableBalance,
      dailyAllowance: currentSummary.recommendedDailyAllowance,
      protectedSavings: currentSummary.protectedSavings,
      projectedMonthEnd: currentSummary.projectedMonthEndBalance,
      healthScore: currentSummary.health.score,
      riskLevel: currentSummary.health.riskLevel,
      depletionDay: beforeDepletion,
    },
    after: {
      spendableBalance: simulatedSummary.spendableBalance,
      dailyAllowance: simulatedSummary.recommendedDailyAllowance,
      protectedSavings: simulatedSummary.protectedSavings,
      projectedMonthEnd: simulatedSummary.projectedMonthEndBalance,
      healthScore: simulatedSummary.health.score,
      riskLevel: simulatedSummary.health.riskLevel,
      depletionDay: afterDepletion,
    },
    delta: {
      spendableBalance: deltaSpendable,
      dailyAllowance: deltaDailyAllowance,
      protectedSavings: deltaProtectedSavings,
      projectedMonthEnd: deltaProjectedMonthEnd,
      healthScore: deltaHealthScore,
    },
    warnings,
    recommendation,
    isAffordable,
    shortfall,
  };
}

/**
 * Generates a full 30-day deterministic forecast.
 */
export function generate30DayForecast(
  transactions: Transaction[],
  commitments: Commitment[],
  savingsGoals: SavingsGoal[],
  options?: { startingBudget?: number; currentDay?: number }
): ForecastDay[] {
  const startingBudget = options?.startingBudget ?? BASELINE_MONTHLY_BUDGET;
  const currentDay = Math.min(
    TOTAL_MONTH_DAYS,
    Math.max(1, options?.currentDay ?? 12)
  );

  // Group historical transactions by day of month (1-30)
  const expensesByDay: Record<number, number> = {};
  const incomeByDay: Record<number, number> = {};

  for (const t of transactions) {
    const day = parseInt(t.date.split('-')[2], 10);
    if (!isNaN(day) && day >= 1 && day <= 30) {
      if (t.type === 'expense') {
        expensesByDay[day] = (expensesByDay[day] || 0) + t.amount;
      } else {
        incomeByDay[day] = (incomeByDay[day] || 0) + t.amount;
      }
    }
  }

  // Group unpaid commitments by due day
  const commitmentsByDay: Record<number, { amount: number; names: string[] }> = {};
  for (const c of commitments) {
    if (!c.isPaid) {
      const dueDay = parseInt(c.dueDate.split('-')[2], 10);
      if (!isNaN(dueDay) && dueDay >= 1 && dueDay <= 30) {
        if (!commitmentsByDay[dueDay]) {
          commitmentsByDay[dueDay] = { amount: 0, names: [] };
        }
        commitmentsByDay[dueDay].amount += c.amount;
        commitmentsByDay[dueDay].names.push(c.name);
      }
    }
  }

  // Summary up to current day
  const summary = calculateFinancialSummary(transactions, commitments, savingsGoals, {
    startingBudget,
    currentDay,
  });

  const dailyAllowance = summary.recommendedDailyAllowance;
  const protectedSavings = summary.protectedSavings;

  const days: ForecastDay[] = [];
  let runningCash = startingBudget;

  for (let day = 1; day <= TOTAL_MONTH_DAYS; day++) {
    const isPast = day < currentDay;
    const isToday = day === currentDay;
    const isFuture = day > currentDay;

    const actualExpense = expensesByDay[day] || 0;
    const actualIncome = incomeByDay[day] || 0;

    const commitmentInfo = commitmentsByDay[day];
    const commitmentAmount = commitmentInfo ? commitmentInfo.amount : 0;
    const commitmentNames = commitmentInfo ? commitmentInfo.names : [];

    let projectedDailySpend = 0;
    if (isPast || isToday) {
      runningCash = runningCash + actualIncome - actualExpense;
      projectedDailySpend = actualExpense;
    } else {
      // Future projection: assume user adheres to recommended daily allowance + any scheduled commitment due that day
      projectedDailySpend = dailyAllowance + commitmentAmount;
      runningCash = runningCash - projectedDailySpend;
    }

    // Remaining unpaid commitments after this day
    let futureUnpaidCommitments = 0;
    for (const c of commitments) {
      if (!c.isPaid) {
        const cDay = parseInt(c.dueDate.split('-')[2], 10);
        if (cDay > day) {
          futureUnpaidCommitments += c.amount;
        }
      }
    }

    const spendableAtDay = Math.max(0, runningCash - futureUnpaidCommitments - protectedSavings);

    days.push({
      dayNumber: day,
      dateStr: `Oct ${day}, 2026`,
      isPast,
      isToday,
      isFuture,
      actualDailySpend: isPast || isToday ? actualExpense : 0,
      projectedDailySpend,
      cashBalance: Math.round(runningCash),
      spendableBalance: Math.round(spendableAtDay),
      commitmentsDue: commitmentAmount,
      commitmentsList: commitmentNames,
      eventNote:
        commitmentNames.length > 0
          ? `Bill Due: ${commitmentNames.join(', ')} (₹${commitmentAmount})`
          : undefined,
    });
  }

  return days;
}

/**
 * Dynamic "Your Next Best Moves" Action Plan Generator
 */
export function generateActionPlan(summary: FinancialSummary, _commitments?: Commitment[]): ActionMove[] {
  const moves: ActionMove[] = [];

  // Check 1: Commitments at risk
  if (summary.currentCashBalance < summary.outstandingCommitments) {
    const gap = summary.outstandingCommitments - summary.currentCashBalance;
    moves.push({
      id: 'move-urgent-commitments',
      title: 'Emergency Bill Reserve Alert',
      description: `Your cash balance is ₹${gap} short of upcoming bills. Freeze all optional spending immediately.`,
      impactLabel: `Protects ₹${summary.outstandingCommitments} in essential payments`,
      impactAmount: gap,
      priority: 'high',
      category: 'commitments',
      actionType: 'open_commitments',
    });
  }

  // Check 2: Low daily allowance
  if (summary.recommendedDailyAllowance < 200 && summary.recommendedDailyAllowance > 0) {
    const neededDaily = 250;
    const diff = (neededDaily - summary.recommendedDailyAllowance) * summary.daysRemaining;
    moves.push({
      id: 'move-curb-discretionary',
      title: 'Cap Discretionary Spending',
      description: `Your current allowance is ₹${summary.recommendedDailyAllowance}/day. Cutting non-essential takeout saves ~₹100/day.`,
      impactLabel: `Recovers +₹${Math.round(diff)} over ${summary.daysRemaining} days`,
      impactAmount: diff,
      priority: 'high',
      category: 'spending',
      actionType: 'open_simulator',
    });
  }

  // Check 3: Audit subscriptions
  if (summary.upcomingSubscriptions > 600) {
    moves.push({
      id: 'move-audit-subs',
      title: 'Review Recurring Subscriptions',
      description: `You have ₹${summary.upcomingSubscriptions} queued in recurring subscriptions this month. Pause unused services.`,
      impactLabel: `Saves up to ₹${summary.upcomingSubscriptions}/month`,
      impactAmount: summary.upcomingSubscriptions,
      priority: 'medium',
      category: 'commitments',
      actionType: 'open_commitments',
    });
  }

  // Check 4: Boost emergency cushion
  if (summary.protectedSavings < 1000 && summary.spendableBalance > 1200) {
    moves.push({
      id: 'move-boost-savings',
      title: 'Ring-Fence ₹500 into Emergency Fund',
      description: 'You have comfortable spendable balance. Moving ₹500 to savings boosts your health score by +8 points.',
      impactLabel: 'Strengthens shock buffer to ₹' + (summary.protectedSavings + 500),
      impactAmount: 500,
      priority: 'medium',
      category: 'savings',
      actionType: 'open_savings',
    });
  }

  // Check 5: Run Simulator before any weekend spending
  moves.push({
    id: 'move-simulate-before-spend',
    title: 'Run "What-If?" Simulator Before Splurging',
    description: 'Test any planned food delivery or party expense before you swipe your card.',
    impactLabel: 'Guarantees zero budget surprises',
    priority: 'low',
    category: 'budget',
    actionType: 'open_simulator',
  });

  return moves;
}
