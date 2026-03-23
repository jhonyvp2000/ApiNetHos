import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { procedimientos } from "@/db/schema";
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
    
    // Preparar el término de búsqueda general (limpiamos puntos por si acaso)
    const cleanQuery = query.replace(/\./g, '');
    const searchTerm = `%${cleanQuery}%`;

    // Multi-variable search: separamos por espacios (ej: "RESECCION INTESTINO" -> ["RESECCION", "INTESTINO"])
    const words = query.trim().split(/\s+/);
    const nameConditions = words.map(word => like(procedimientos.nombre, `%${word}%`));

    const resultados = await db
      .select({
        codigo: sql<string>`RTRIM(${procedimientos.codigo})`, // Usar rtrim() para limpiar espacios si column es varchar(15) y sobran
        nombre: sql<string>`RTRIM(${procedimientos.nombre})`,
        activo: procedimientos.activo,
      })
      .from(procedimientos)
      .where(or(
        like(procedimientos.codigo, searchTerm),
        and(...nameConditions)
      ));
      
    // Si necesitas límite global, puedes devolver arrays parseados 
    return NextResponse.json({ success: true, count: resultados.length, data: resultados.slice(0, 50) });
  } catch (error: any) {
    console.error("Error searching procedimientos:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
