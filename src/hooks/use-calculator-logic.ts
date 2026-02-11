"use client";

import { useState, useMemo, useEffect } from "react";
import { DEFAULT_SALARIO_CONFIG } from "@/types/salarios";
import { TASAS_RECARGO } from "@/lib/salarios";
import { useSalarios } from "@/hooks/use-salarios";

export function useCalculatorLogic() {
  const { config: remoteConfig, fetchLatestConfig, loading } = useSalarios();
  const [salarioInput, setSalarioInput] = useState<string>(String(DEFAULT_SALARIO_CONFIG.salarioBase));
  const [horas, setHoras] = useState<number>(182);
  const [extras, setExtras] = useState({
    diurnas: 0,
    nocturnas: 0,
    recargoNocturno: 0,
    dominicales: 0,
  });

  useEffect(() => {
    fetchLatestConfig();
  }, [fetchLatestConfig]);

  useEffect(() => {
    if (remoteConfig?.salarioBase) {
      setSalarioInput(String(remoteConfig.salarioBase));
      setHoras(remoteConfig.horasLegales);
    }
  }, [remoteConfig]);

  const resultados = useMemo(() => {
    const config = remoteConfig || DEFAULT_SALARIO_CONFIG;
    const currentSalarioBase = salarioInput === "" ? 0 : Number(salarioInput);
    
    const valorHora = currentSalarioBase / config.horasLegales;
    const salarioBasePeriodo = valorHora * horas;
    
    const tieneSubsidio = currentSalarioBase <= config.salarioBase * 2;
    const subsidioTransporte = tieneSubsidio 
      ? (config.auxilioTransporte / config.horasLegales) * horas 
      : 0;

    const pagoExtrasDiurnas = extras.diurnas * (valorHora * TASAS_RECARGO.EXTRA_DIURNA);
    const pagoExtrasNocturnas = extras.nocturnas * (valorHora * TASAS_RECARGO.EXTRA_NOCTURNA);
    const pagoRecargoNocturno = extras.recargoNocturno * (valorHora * TASAS_RECARGO.RECARGO_NOCTURNO);
    const pagoDominicales = extras.dominicales * (valorHora * TASAS_RECARGO.DOMINICAL_FESTIVO);
    
    const totalRecargos = pagoExtrasDiurnas + pagoExtrasNocturnas + pagoRecargoNocturno + pagoDominicales;
    
    const salarioBruto = salarioBasePeriodo + totalRecargos + subsidioTransporte;
    
    const baseCotizacion = salarioBasePeriodo + totalRecargos;
    const saludEmpleado = baseCotizacion * 0.04;
    const pensionEmpleado = baseCotizacion * 0.04;
    
    let solidaridadEmpleado = 0;
    if (currentSalarioBase > config.salarioBase * 4) {
      solidaridadEmpleado = baseCotizacion * 0.01;
    }
    
    const totalDeducciones = saludEmpleado + pensionEmpleado + solidaridadEmpleado;
    const salarioNeto = salarioBruto - totalDeducciones;
    
    const costoExtraEmpresa = salarioBasePeriodo * (config.costoEmpleado / 100);
    const totalCostoEmpresaBase = salarioBasePeriodo + costoExtraEmpresa;
    
    const gananciaValor = salarioBasePeriodo * (config.ganancia / 100);
    const subtotalEmpresa = totalCostoEmpresaBase + gananciaValor + totalRecargos + subsidioTransporte;
    
    const ivaValor = subtotalEmpresa * (config.iva / 100);
    const totalFinal = subtotalEmpresa + ivaValor;

    return {
      salarioBase: salarioBasePeriodo,
      pagoRecargos: totalRecargos,
      subsidioTransporte,
      tieneSubsidio,
      salarioBruto,
      saludEmpleado,
      pensionEmpleado,
      solidaridadEmpleado,
      totalDeducciones,
      salarioNeto,
      salarioEmpresa: salarioBasePeriodo,
      cargaEmpresa: costoExtraEmpresa,
      costoLaboralTotal: totalCostoEmpresaBase,
      gananciaEmpresa: gananciaValor,
      ivaEmpresa: ivaValor,
      costoTotalEmpresa: totalFinal
    };
  }, [salarioInput, horas, extras, remoteConfig]);

  return {
    remoteConfig,
    loading,
    salarioInput,
    setSalarioInput,
    horas,
    setHoras,
    extras,
    setExtras,
    resultados
  };
}
