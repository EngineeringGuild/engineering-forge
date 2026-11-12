import { describe, it, expect } from 'vitest';
import React from 'react';
import { Input } from './atoms/Input';
import { Button } from './atoms/Button';

describe('Atomic Design System - Atoms Suite (Input & Button)', () => {
  it('renders Input atom with label, placeholder and unit', () => {
    const element = React.createElement(Input, {
      label: 'Carga Pontual (kN)',
      placeholder: '40',
      unit: 'kN',
      type: 'number',
      defaultValue: 40,
    });

    expect(element.props.label).toBe('Carga Pontual (kN)');
    expect(element.props.unit).toBe('kN');
    expect(element.props.defaultValue).toBe(40);
  });

  it('renders Input atom with error message state', () => {
    const element = React.createElement(Input, {
      label: 'Tensão',
      error: 'Valor excede limite de segurança',
    });

    expect(element.props.error).toBe('Valor excede limite de segurança');
  });

  it('renders Button atom with accent variant and icon', () => {
    const icon = React.createElement('span', null, '⚙️');
    const element = React.createElement(
      Button,
      {
        variant: 'accent',
        icon,
      },
      'Calibrar Forja'
    );

    expect(element.props.variant).toBe('accent');
    expect(element.props.children).toBe('Calibrar Forja');
  });
});
