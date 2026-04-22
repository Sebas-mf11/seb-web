'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type PlanParam = 'esencial' | 'profesional' | 'avanzado';

export default function CotizadorRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const raw = searchParams.get('plan');
    const plan =
      raw === 'esencial' || raw === 'profesional' || raw === 'avanzado'
        ? (raw as PlanParam)
        : null;
    const target = plan ? `/precios?plan=${plan}` : '/precios';
    router.replace(target);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="flex items-center gap-3 text-white/60 text-sm">
        <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        <span>Cargando cotizador</span>
      </div>
    </div>
  );
}