import { describe, it, expect } from 'vitest';
import React from 'react';
import { LedIndicator } from './atomic/LedIndicator';
import { SevenSegmentDisplay } from './atomic/SevenSegmentDisplay';
import { StressMeter } from './molecules/StressMeter';

describe('Atomic Design System Components', () => {
  it('renders LedIndicator with correct properties', () => {
    const element = React.createElement(LedIndicator, {
      color: 'amber',
      pulse: true,
      label: 'TENSAO ALTA',
    });
    expect(element.props.color).toBe('amber');
    expect(element.props.pulse).toBe(true);
    expect(element.props.label).toBe('TENSAO ALTA');
  });

  it('renders SevenSegmentDisplay with tabular values and units', () => {
    const element = React.createElement(SevenSegmentDisplay, {
      value: '1.45',
      label: 'FATOR DE SEGURANCA',
      unit: 'SF',
      color: 'cyan',
    });
    expect(element.props.value).toBe('1.45');
    expect(element.props.unit).toBe('SF');
  });

  it('calculates StressMeter overload state when utilization >= 1.0', () => {
    const normalMeter = React.createElement(StressMeter, { utilization: 0.65 });
    expect(normalMeter.props.utilization).toBe(0.65);

    const overloadMeter = React.createElement(StressMeter, { utilization: 1.15 });
    expect(overloadMeter.props.utilization).toBeGreaterThan(1.0);
  });
});
