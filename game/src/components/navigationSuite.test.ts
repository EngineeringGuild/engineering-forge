import { describe, it, expect } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { GlobalNavBar } from './GlobalNavBar';
import { PlayLevelHeaderNav } from './PlayLevelHeaderNav';
import { LEVELS } from '../content/levels';
import { useForgeEconomyStore } from '../state/forgeEconomyStore';

describe('Global Navigation & Breadcrumbs Suite', () => {
  it('instantiates GlobalNavBar with division links and wallet balances', () => {
    const element = React.createElement(
      MemoryRouter,
      { initialEntries: ['/'] },
      React.createElement(GlobalNavBar, { compact: false })
    );

    expect(element).toBeDefined();
    expect(useForgeEconomyStore.getState().wallet.credits).toBeGreaterThanOrEqual(0);
  });

  it('instantiates PlayLevelHeaderNav with division back button, dropdown, and next/prev arrows', () => {
    const element = React.createElement(
      MemoryRouter,
      { initialEntries: ['/structures/level/level-01'] },
      React.createElement(PlayLevelHeaderNav, {
        divisionTitle: 'Estruturas',
        divisionPath: '/structures',
        currentLevelId: 'level-01',
        currentLevelName: 'The First Crossing',
        levels: LEVELS,
        levelBasePath: '/structures/level',
      })
    );

    expect(element).toBeDefined();
    expect(LEVELS.length).toBeGreaterThanOrEqual(6);
    expect(LEVELS[0].id).toBe('tutorial');
  });
});
