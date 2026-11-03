import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { SalariesService } from '../../shared/data/salaries.service';
import { ConfirmService } from '../../shared/ui/confirm';
import { PayrollCalculation } from './payroll-calculation';

describe('PayrollCalculation – approval is bound to the calculation', () => {
  const summary = { calculationId: 'calc-42', calculated: 3, totalEntitlements: '1', totalDeductions: '1', totalNet: '1', notCalculated: 0 };
  let svc: { calculate: ReturnType<typeof vi.fn>; approve: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    svc = { calculate: vi.fn(() => of(summary)), approve: vi.fn(() => of({})) };
    TestBed.configureTestingModule({
      imports: [PayrollCalculation],
      providers: [provideHttpClient(), provideRouter([]), { provide: SalariesService, useValue: svc }, { provide: ConfirmService, useValue: { ask: () => Promise.resolve(true) } }],
    });
  });

  function setup() {
    const f = TestBed.createComponent(PayrollCalculation);
    const c = f.componentInstance as unknown as Record<string, any>;
    f.detectChanges();
    c['appointType'].set('دائم');
    f.detectChanges();
    return { f, c };
  }

  it('approves using the calculationId, not the current filters', async () => {
    const { f, c } = setup();
    c['calc']();
    f.detectChanges();
    expect(c['summary']()?.calculationId).toBe('calc-42');
    await c['approve']();
    expect(svc.approve).toHaveBeenCalledWith('calc-42');
  });

  it('discards the result when a filter changes, so it cannot be approved', async () => {
    const { f, c } = setup();
    c['calc']();
    f.detectChanges();
    c['month'].set('نوفمبر');
    f.detectChanges();
    expect(c['summary']()).toBeNull();
    await c['approve']();
    expect(svc.approve).not.toHaveBeenCalled();
  });

  it('does not approve twice', async () => {
    const { f, c } = setup();
    c['calc']();
    f.detectChanges();
    await c['approve']();
    await c['approve']();
    expect(svc.approve).toHaveBeenCalledTimes(1);
  });
});
