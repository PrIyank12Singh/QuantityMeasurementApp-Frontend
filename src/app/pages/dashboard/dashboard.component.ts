import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { QuantityService, QuantityDTO, OperationResult, HistoryEntry } from '../../services/quantity.service';

type Operation = 'convert' | 'compare' | 'add' | 'subtract' | 'multiply' | 'divide';
type Tab = 'calculator' | 'history';

interface UnitGroup { type: string; units: string[]; }

const UNIT_GROUPS: UnitGroup[] = [
  { type: 'LENGTH',      units: ['METER','KILOMETER','CENTIMETER','MILLIMETER','INCH','FOOT','YARD','MILE'] },
  { type: 'WEIGHT',      units: ['KILOGRAM','GRAM','MILLIGRAM','POUND','OUNCE','TON'] },
  { type: 'VOLUME',      units: ['LITER','MILLILITER','CUBIC_METER','GALLON','QUART','PINT','CUP','FLUID_OUNCE'] },
  { type: 'TEMPERATURE', units: ['CELSIUS','FAHRENHEIT','KELVIN'] },
  { type: 'AREA',        units: ['SQUARE_METER','SQUARE_KILOMETER','SQUARE_FOOT','SQUARE_INCH','ACRE','HECTARE'] },
  { type: 'TIME',        units: ['SECOND','MINUTE','HOUR','DAY','WEEK'] },
  { type: 'SPEED',       units: ['METER_PER_SECOND','KILOMETER_PER_HOUR','MILE_PER_HOUR','KNOT'] },
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  user: { email: string; name: string } | null = null;
  activeTab: Tab = 'calculator';
  operation: Operation = 'convert';
  loading = false;
  errorMsg = '';
  result: OperationResult | null = null;
  history: HistoryEntry[] = [];
  historyLoading = false;

  unitGroups = UNIT_GROUPS;
  operations: { key: Operation; label: string; icon: string }[] = [
    { key: 'convert',  label: 'Convert',  icon: '🔄' },
    { key: 'compare',  label: 'Compare',  icon: '⚖️' },
    { key: 'add',      label: 'Add',      icon: '➕' },
    { key: 'subtract', label: 'Subtract', icon: '➖' },
    { key: 'multiply', label: 'Multiply', icon: '✖️' },
    { key: 'divide',   label: 'Divide',   icon: '➗' },
  ];

  firstValue = 0;
  firstType = 'LENGTH';
  firstUnit = 'METER';
  secondValue = 0;
  secondType = 'LENGTH';
  secondUnit = 'KILOMETER';
  targetUnit = 'KILOMETER';

  constructor(
    private authService: AuthService,
    private quantityService: QuantityService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
  }

  get firstUnits(): string[] {
    return this.unitGroups.find(g => g.type === this.firstType)?.units ?? [];
  }

  get secondUnits(): string[] {
    return this.unitGroups.find(g => g.type === this.secondType)?.units ?? [];
  }

  get targetUnits(): string[] {
    return this.unitGroups.find(g => g.type === this.firstType)?.units ?? [];
  }

  isBinaryOp(): boolean {
    return ['compare', 'add', 'subtract', 'multiply', 'divide'].includes(this.operation);
  }

  onTypeChange(which: 'first' | 'second'): void {
    if (which === 'first') {
      this.firstUnit = this.firstUnits[0];
      this.targetUnit = this.firstUnits[1] ?? this.firstUnits[0];
    } else {
      this.secondUnit = this.secondUnits[0];
    }
  }

  onSubmit(): void {
    this.loading = true;
    this.result = null;
    this.errorMsg = '';
    this.cdr.detectChanges(); // force loading state to show

    const q1: QuantityDTO = { value: this.firstValue, unitName: this.firstUnit, measurementType: this.firstType };
    const q2: QuantityDTO = { value: this.secondValue, unitName: this.secondUnit, measurementType: this.secondType };

    let obs$;
    switch (this.operation) {
      case 'convert':  obs$ = this.quantityService.convert(q1, this.targetUnit); break;
      case 'compare':  obs$ = this.quantityService.compare(q1, q2); break;
      case 'add':      obs$ = this.quantityService.add(q1, q2, this.targetUnit); break;
      case 'subtract': obs$ = this.quantityService.subtract(q1, q2, this.targetUnit); break;
      case 'multiply': obs$ = this.quantityService.multiply(q1, q2, this.targetUnit); break;
      case 'divide':   obs$ = this.quantityService.divide(q1, q2, this.targetUnit); break;
    }

    obs$.subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
        this.cdr.detectChanges(); // force result to render immediately
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Operation failed';
        this.loading = false;
        this.cdr.detectChanges(); // force error to render immediately
      }
    });
  }

  loadHistory(): void {
    this.historyLoading = true;
    this.quantityService.getHistory().subscribe({
      next: (h) => {
        this.history = h;
        this.historyLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.historyLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  switchTab(tab: Tab): void {
    this.activeTab = tab;
    if (tab === 'history' && this.history.length === 0) {
      this.loadHistory();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
