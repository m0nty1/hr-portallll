import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { EmployeesService } from '../../shared/data/employees.service';
import { MOCK_PROFILE, MOCK_SALARY_VARS } from '../../shared/data/mock-data';
import { ToastService } from '../../shared/ui/toast';
import { EmployeeProfile } from './employee-profile';

describe('EmployeeProfile – save', () => {
  let toast: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  function setup(salaryFails: boolean) {
    toast = { success: vi.fn(), error: vi.fn() };
    const svc = {
      profile: () => of(structuredClone(MOCK_PROFILE)),
      salaryVariables: () => of(structuredClone(MOCK_SALARY_VARS)),
      saveProfile: vi.fn((_: string, p: unknown) => of(p)),
      saveSalaryVariables: vi.fn(() => (salaryFails ? throwError(() => new Error('x')) : of({}))),
    };
    TestBed.configureTestingModule({
      imports: [EmployeeProfile],
      providers: [provideHttpClient(), provideRouter([]), { provide: EmployeesService, useValue: svc }, { provide: ToastService, useValue: toast }],
    });
    const f = TestBed.createComponent(EmployeeProfile);
    f.componentRef.setInput('id', '00067');
    f.detectChanges();
    return { f, c: f.componentInstance as unknown as Record<string, any>, svc };
  }

  it('shows success only when both parts are saved', () => {
    const { f, c } = setup(false);
    c['startEdit'](); f.detectChanges();
    c['save'](); f.detectChanges();
    expect(toast.success).toHaveBeenCalled();
    expect(c['editing']()).toBe(false);
  });

  it('reports a partial failure and stays in edit mode', () => {
    const { f, c } = setup(true);
    c['startEdit'](); f.detectChanges();
    c['save'](); f.detectChanges();
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
    expect(c['editing']()).toBe(true);
  });

  it('drops edit state when another employee is opened', () => {
    const { f, c } = setup(false);
    c['startEdit'](); f.detectChanges();
    f.componentRef.setInput('id', '00066'); f.detectChanges();
    expect(c['editing']()).toBe(false);
  });
});
