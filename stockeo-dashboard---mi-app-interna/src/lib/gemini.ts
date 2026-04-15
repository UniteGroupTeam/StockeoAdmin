import { GoogleGenAI } from "@google/genai";
import { Sale } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getSalesInsights = async (sales: Sale[]) => {
  if (sales.length === 0) return "No hay ventas suficientes para generar insights.";

  const salesSummary = sales.flatMap(s => s.items.map(item => ({
    product: item.productName,
    category: item.category,
    profit: item.profit,
    type: item.saleType
  })));

  const prompt = `Analiza estas ventas recientes de mi tienda Stockeo y dame 3 consejos rápidos (máximo 2 frases cada uno) para mejorar las ganancias. 
  Enfócate en qué categorías son más rentables o qué tipo de venta (Menudeo/Mayoreo) está funcionando mejor.
  
  Ventas: ${JSON.stringify(salesSummary.slice(0, 20))}
  
  Responde en español, con un tono profesional y motivador.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating insights:", error);
    return "No se pudieron generar insights en este momento.";
  }
};
