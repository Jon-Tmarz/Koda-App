import { z } from "zod";

export const calculatorSchema = z.object({
  baseSalary: z.number({ invalid_type_error: "Debe ser un número" }).positive({ message: "El salario debe ser mayor a 0." }),
  extraHours: z.object({
    daytime: z.number().min(0).default(0),
    nighttime: z.number().min(0).default(0),
    daytimeHoliday: z.number().min(0).default(0),
    nighttimeHoliday: z.number().min(0).default(0),
  }),
});

export type CalculatorFormInput = z.infer<typeof calculatorSchema>;

export interface CalculatedIncome {
  baseSalary: number;
  transportationAid: number;
  extraHoursTotal: number;
  totalIncome: number;
}

export interface CalculatedDeductions {
  health: number;
  pension: number;
  solidarityFund: number;
  totalDeductions: number;
}

export interface CalculatorResults {
  income: CalculatedIncome;
  deductions: CalculatedDeductions;
  netSalary: number;
}