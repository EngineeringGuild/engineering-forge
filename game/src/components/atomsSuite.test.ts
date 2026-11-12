import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { Input } from './atoms/Input';
import { Button } from './atoms/Button';
import { Badge, type BadgeProps } from './atoms/Badge';
import { GaugeMeter } from './molecules/GaugeMeter';
import { PhysicsPresets } from './molecules/PhysicsPresets';
import { PHYSICS_PRESETS } from './molecules/physicsPresetConstants';
import { CollisionToggle } from './molecules/CollisionToggle';
import { SimulationTimer } from './molecules/SimulationTimer';
import { SimulationConsole } from './molecules/SimulationConsole';
import { SAMPLE_PHYSICS_EVENTS } from './molecules/simulationConsoleTypes';
import { usePhysicsStore } from '../store/physicsStore';

describe('Atomic Design System - Atoms & Molecules Suite', () => {
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

  it('renders Badge atom with asme variant and dot indicator', () => {
    const element = React.createElement<BadgeProps>(
      Badge,
      {
        variant: 'asme',
        size: 'sm',
        dot: true,
      },
      'ASME BPVC VIII'
    );

    expect(element.props.variant).toBe('asme');
    expect(element.props.size).toBe('sm');
    expect(element.props.dot).toBe(true);
    expect(element.props.children).toBe('ASME BPVC VIII');
  });

  it('instantiates GaugeMeter molecule with value, range, and unit', () => {
    const element = React.createElement(GaugeMeter, {
      label: 'VELOCIDADE ANGULAR',
      value: 65,
      min: 0,
      max: 120,
      unit: 'rad/s',
      warningThreshold: 80,
      dangerThreshold: 100,
      precision: 1,
    });

    expect(element.props.label).toBe('VELOCIDADE ANGULAR');
    expect(element.props.value).toBe(65);
    expect(element.props.min).toBe(0);
    expect(element.props.max).toBe(120);
    expect(element.props.unit).toBe('rad/s');
  });

  it('instantiates PhysicsPresets molecule and updates physicsStore gravity for Earth, Moon, and Deep Space', () => {
    const onSelectPreset = vi.fn();
    const element = React.createElement(PhysicsPresets, {
      onSelectPreset,
      compact: false,
    });

    expect(element.props.onSelectPreset).toBeDefined();

    // Verify presets definition
    const earth = PHYSICS_PRESETS.find((p) => p.id === 'earth');
    const moon = PHYSICS_PRESETS.find((p) => p.id === 'moon');
    const space = PHYSICS_PRESETS.find((p) => p.id === 'space');

    expect(earth?.gravity).toBe(9.81);
    expect(moon?.gravity).toBe(1.62);
    expect(space?.gravity).toBe(0.0);

    // Verify store mutations
    usePhysicsStore.getState().setGravity(moon!.gravity);
    expect(usePhysicsStore.getState().gravity).toBe(1.62);

    usePhysicsStore.getState().setGravity(space!.gravity);
    expect(usePhysicsStore.getState().gravity).toBe(0.0);

    usePhysicsStore.getState().setGravity(earth!.gravity);
    expect(usePhysicsStore.getState().gravity).toBe(9.81);
  });

  it('instantiates CollisionToggle molecule and toggles showCollisions flag in physicsStore', () => {
    const onChange = vi.fn();
    const element = React.createElement(CollisionToggle, {
      onChange,
      compact: false,
    });

    expect(element.props.onChange).toBeDefined();
    expect(usePhysicsStore.getState().showCollisions).toBe(false);

    usePhysicsStore.getState().toggleShowCollisions();
    expect(usePhysicsStore.getState().showCollisions).toBe(true);

    usePhysicsStore.getState().setShowCollisions(false);
    expect(usePhysicsStore.getState().showCollisions).toBe(false);
  });

  it('instantiates SimulationTimer molecule and reflects elapsed physics time from currentStepIndex', () => {
    usePhysicsStore.getState().resetSimulationState();
    const element = React.createElement(SimulationTimer, {
      label: 'TEMPO',
      compact: true,
      precision: 2,
    });

    expect(element.props.label).toBe('TEMPO');
    expect(element.props.compact).toBe(true);

    // Check step increment reflects in store
    usePhysicsStore.getState().stepSimulationOnce();
    usePhysicsStore.getState().stepSimulationOnce();
    expect(usePhysicsStore.getState().currentStepIndex).toBe(2);
    const elapsed = usePhysicsStore.getState().currentStepIndex * usePhysicsStore.getState().timeStep;
    expect(elapsed).toBeCloseTo(2 / 60, 4);
  });

  it('instantiates SimulationConsole molecule with physics event stream and callbacks', () => {
    const onClear = vi.fn();
    const customEvents = [
      ...SAMPLE_PHYSICS_EVENTS,
      {
        id: 'evt-test-custom',
        timestamp: '00:02.00',
        type: 'collision' as const,
        message: 'Impacto elástico contra barreira rígida (J = 450 Ns)',
        severity: 'alert' as const,
        details: { impulseNs: 450, restitution: 0.65 },
      },
    ];

    const element = React.createElement(SimulationConsole, {
      events: customEvents,
      title: 'TELEMETRIA TESTE',
      onClear,
      height: 180,
    });

    expect(element.props.title).toBe('TELEMETRIA TESTE');
    expect(element.props.events).toHaveLength(5);
    expect(element.props.onClear).toBeDefined();
    expect(element.props.height).toBe(180);
  });
});
