'use server';
/**
 * @fileOverview Herramienta de IA para Santa Night Club que aplica la "Regla de Oro":
 * 1. Unidades previas a la llegada de la 2da chica -> 100% para la 1ra.
 * 2. Unidades posteriores (compartidas) -> 50/50 entre ambas.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AICommissionSplitOptimizerInputSchema = z.object({
  scenarioDescription: z.string().describe('Descripción del garzón (ej. "Eran 6 botellas, Elena tomó 4 sola y Lucía se unió para las 2 finales").'),
  hostesses: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })),
  productsConsumed: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    totalQuantity: z.number().positive(),
    commissionPerUnit: z.number().positive(),
  })),
});
export type AICommissionSplitOptimizerInput = z.infer<typeof AICommissionSplitOptimizerInputSchema>;

const AICommissionSplitOptimizerOutputSchema = z.object({
  suggestedDistribution: z.array(z.object({
    hostessId: z.string(),
    hostessName: z.string(),
    productAllocations: z.array(z.object({
      productId: z.string(),
      productName: z.string(),
      allocatedUnits: z.number().describe('Unidades finales calculadas (ej. 3.0, 1.0)'),
      allocatedCommission: z.number().describe('Comisión total en Bs. para esta chica'),
    })),
    totalCommissionForHostess: z.number(),
  })),
  analysis: z.string().describe('Explicación detallada del cálculo en ESPAÑOL.'),
});
export type AICommissionSplitOptimizerOutput = z.infer<typeof AICommissionSplitOptimizerOutputSchema>;

export async function aiCommissionSplitOptimizer(input: AICommissionSplitOptimizerInput): Promise<AICommissionSplitOptimizerOutput> {
  return aiCommissionSplitOptimizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCommissionSplitOptimizerPrompt',
  input: { schema: AICommissionSplitOptimizerInputSchema },
  output: { schema: AICommissionSplitOptimizerOutputSchema },
  prompt: `Eres el liquidador oficial de Santa Night Club. Debes aplicar la REGLA DE LLEGADA TARDÍA estrictamente.

REGLA MATEMÁTICA:
- Unidades Tomadas Solas = Total - Unidades Compartidas.
- Comisión Chica 1 = (Unidades Tomadas Solas * 100% Comisión) + (Unidades Compartidas * 50% Comisión).
- Comisión Chica 2 = (Unidades Compartidas * 50% Comisión).

EJEMPLO:
Total: 4 cervezas. Elena tomó 2 sola. Lucía se unió para las últimas 2.
1. Unidades Solas (Elena): 2.
2. Unidades Compartidas: 2 (se dividen 1 para cada una).
Resultado: Elena recibe comisión por 3 botellas. Lucía recibe comisión por 1 botella.

Entrada:
Escenario: {{{scenarioDescription}}}
{{#each productsConsumed}}
Producto: {{productName}} ({{totalQuantity}} total, {{commissionPerUnit}} Bs de comisión por unidad)
{{/each}}

Tu tarea:
1. Identifica cuántas unidades fueron exclusivas y cuántas compartidas según el escenario.
2. Calcula las unidades finales y la comisión en Bs para cada chica.
3. El análisis debe ser transparente y explicar la suma (ej. "Elena: 2 solas + 1 compartida = 3").`,
});

const aiCommissionSplitOptimizerFlow = ai.defineFlow(
  {
    name: 'aiCommissionSplitOptimizerFlow',
    inputSchema: AICommissionSplitOptimizerInputSchema,
    outputSchema: AICommissionSplitOptimizerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
