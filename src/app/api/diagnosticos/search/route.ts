import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { diagnosticos } from "@/db/schema";
import { like, or, sql, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { success: false, error: "El parámetro de búsqueda 'query' es requerido." },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Si la persona manda "K35.0" podemos limpiarlo para que la BD de MSSQL reaccione porque en MSSQL no hay puntos
    const cleanQuery = query.replace(/\./g, '');
    const searchTerm = `%${cleanQuery}%`;

    // Multi-variable search: separamos por espacios (ej: "ABDOMEN DOLOR" -> ["ABDOMEN", "DOLOR"])
    const words = query.trim().split(/\s+/);
    const nameConditions = words.map(word => like(diagnosticos.nombre, `%${word}%`));

    const resultados = await db
      .select({
        codigo: sql<string>`RTRIM(${diagnosticos.codigo})`, // Limpiamos espacios trailing
        nombre: sql<string>`RTRIM(${diagnosticos.nombre})`,
        activo: diagnosticos.activo,
      })
      .from(diagnosticos)
      .where(or(
        like(diagnosticos.codigo, searchTerm),
        and(...nameConditions)
      ));
      
    return NextResponse.json({ success: true, count: resultados.length, data: resultados.slice(0, 50) });
  } catch (error: any) {
    console.error("Error searching diagnosticos:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
