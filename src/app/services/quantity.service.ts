import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface QuantityDTO {
  value: number;
  unitName: string;        // ← was 'unit', backend expects 'unitName'
  measurementType: string;
}

export interface OperationResult {
  operationType: string;
  firstQuantity?: QuantityDTO;
  secondQuantity?: QuantityDTO;
  resultQuantity?: QuantityDTO;
  comparisonResult?: boolean;
  successful: boolean;
  errorMessage?: string;
}

export interface HistoryEntry {
  id: number;
  operationType: string;
  firstOperandValue?: number;
  firstUnit?: string;
  secondOperandValue?: number;
  secondUnit?: string;
  resultOperandValue?: number;
  resultUnit?: string;
  comparisonResult?: boolean;
  successful: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class QuantityService {
  private baseUrl = 'http://localhost:8080/api/quantity';

  constructor(private http: HttpClient) {}

  convert(sourceQuantity: QuantityDTO, targetUnit: string): Observable<OperationResult> {
    return this.http.post<OperationResult>(`${this.baseUrl}/convert`, { sourceQuantity, targetUnit });
  }

  compare(firstQuantity: QuantityDTO, secondQuantity: QuantityDTO): Observable<OperationResult> {
    return this.http.post<OperationResult>(`${this.baseUrl}/compare`, { firstQuantity, secondQuantity });
  }

  add(firstQuantity: QuantityDTO, secondQuantity: QuantityDTO, resultUnit: string): Observable<OperationResult> {
    return this.http.post<OperationResult>(`${this.baseUrl}/add`, { firstQuantity, secondQuantity, resultUnit });
  }

  subtract(firstQuantity: QuantityDTO, secondQuantity: QuantityDTO, resultUnit: string): Observable<OperationResult> {
    return this.http.post<OperationResult>(`${this.baseUrl}/subtract`, { firstQuantity, secondQuantity, resultUnit });
  }

  multiply(firstQuantity: QuantityDTO, secondQuantity: QuantityDTO, resultUnit: string): Observable<OperationResult> {
    return this.http.post<OperationResult>(`${this.baseUrl}/multiply`, { firstQuantity, secondQuantity, resultUnit });
  }

  divide(firstQuantity: QuantityDTO, secondQuantity: QuantityDTO, resultUnit: string): Observable<OperationResult> {
    return this.http.post<OperationResult>(`${this.baseUrl}/divide`, { firstQuantity, secondQuantity, resultUnit });
  }

  getHistory(): Observable<HistoryEntry[]> {
    return this.http.get<HistoryEntry[]>(`${this.baseUrl}/history`);
  }
}
