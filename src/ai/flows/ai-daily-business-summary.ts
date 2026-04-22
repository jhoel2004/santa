'use server';
/**
 * @fileOverview Un agente de IA que genera un resumen diario del negocio a partir de los datos analíticos proporcionados.
 *
 * - generateDailyBusinessSummary - Una función que maneja la generación del resumen diario del negocio.
 * - DailyBusinessSummaryInput - El tipo de entrada para la función generateDailyBusinessSummary.
 * - DailyBusinessSummaryOutput - El tipo de retorno para la función generateDailyBusinessSummary.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DailyBusinessSummaryInputSchema = z.object({
  date: z.string().describe('La fecha para la cual se está generando el resumen (ej., "YYYY-MM-DD").'),
  dailyRevenue: z.number().describe('Ingresos totales del día en Bs.'),
  dailyCommissions: z.number().describe('Comisiones totales pagadas en el día en Bs.'),
  topConsumingHostesses: z.array(z.object({
    name: z.string().describe('Nombre de la chica.'),
    totalConsumption: z.number().describe('Consumo total (en Bs) por esta chica.'),
  })).describe('Un array de las chicas con mayor consumo y su consumo total.'),
  topSellingWaiters: z.array(z.object({
    name: z.string().describe('Nombre del mesero.'),
    totalSales: z.number().describe('Ventas totales (en Bs) generadas por este mesero.'),
  })).describe('Un array de los meseros con más ventas y sus ventas totales.'),
});
export type DailyBusinessSummaryInput = z.infer<typeof DailyBusinessSummaryInputSchema>;

const DailyBusinessSummaryOutputSchema = z.string().describe('Un resumen generado por IA de las métricas clave del negocio en español.');
export type DailyBusinessSummaryOutput = z.infer<typeof DailyBusinessSummaryOutputSchema>;

export async function generateDailyBusinessSummary(input: DailyBusinessSummaryInput): Promise<DailyBusinessSummaryOutput> {
  return dailyBusinessSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dailyBusinessSummaryPrompt',
  input: { schema: DailyBusinessSummaryInputSchema },
  output: { schema: DailyBusinessSummaryOutputSchema },
  prompt: `Genera un resumen de negocio diario conciso para NeonShift para la fecha: {{{date}}}.

IMPORTANTE: El resumen debe estar escrito en ESPAÑOL.

Enfócate en perspectivas clave, tendencias y aspectos destacados del rendimiento para un Administrador. Utiliza los siguientes datos:

Ingresos Diarios: Bs. {{{dailyRevenue}}}
Comisiones Diarias Pagadas: Bs. {{{dailyCommissions}}}

Chicas con Mayor Consumo:
{{#if topConsumingHostesses}}
{{#each topConsumingHostesses}}
- {{name}} (Consumo: Bs. {{totalConsumption}})
{{/each}}
{{else}}
No hay datos de consumo disponibles.
{{/if}}

Meseros con Más Ventas:
{{#if topSellingWaiters}}
{{#each topSellingWaiters}}
- {{name}} (Ventas: Bs. {{totalSales}})
{{/each}}
{{else}}
No hay datos de ventas disponibles.
{{/if}}

Analiza los datos y proporciona un resumen que incluya:
- Rendimiento financiero general (ingresos vs. comisiones).
- Destacados de las chicas y meseros con mejor desempeño.
- Cualquier tendencia notable o perspectiva que un Administrador deba considerar para la toma de decisiones.`,
});

const dailyBusinessSummaryFlow = ai.defineFlow(
  {
    name: 'dailyBusinessSummaryFlow',
    inputSchema: DailyBusinessSummaryInputSchema,
    outputSchema: DailyBusinessSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
