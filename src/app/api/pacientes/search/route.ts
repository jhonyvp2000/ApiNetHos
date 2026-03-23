import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { paciente, pacienteDato } from "@/db/schema";
import { eq, like, or, and, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documento = searchParams.get("documento");
    const nombres = searchParams.get("nombres");
    const apellidoPaterno = searchParams.get("apellidoPaterno");
    const apellidoMaterno = searchParams.get("apellidoMaterno");
    const q = searchParams.get("q");

    if (!documento && !nombres && !apellidoPaterno && !apellidoMaterno && !q) {
      return NextResponse.json(
        { success: false, error: "Se requiere al menos un parámetro de búsqueda (q, documento, nombres, apellidoPaterno o apellidoMaterno)." },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Preparar lista de condiciones AND
    const condiciones = [];

    // Lógica para búsqueda inteligente por múltiples palabras clave
    if (q) {
      const tokens = q.split(/\s+/).filter(t => t.length > 0);
      for (const token of tokens) {
        const term = `%${token}%`;
        condiciones.push(
          or(
            like(paciente.documentoNumero, term),
            like(paciente.descripcion, term),
            like(paciente.observacion, term),
            like(pacienteDato.nombres, term),
            like(pacienteDato.apellidoPaterno, term),
            like(pacienteDato.apellidoMaterno, term)
          )
        );
      }
    }

    if (documento) {
      const docTerm = `%${documento}%`;
      condiciones.push(
        or(
          like(paciente.documentoNumero, docTerm),
          like(paciente.descripcion, docTerm),
          like(paciente.observacion, docTerm)
        )
      );
    }
    
    if (nombres) {
      condiciones.push(like(pacienteDato.nombres, `%${nombres}%`));
    }
    
    if (apellidoPaterno) {
      condiciones.push(like(pacienteDato.apellidoPaterno, `%${apellidoPaterno}%`));
    }
    
    if (apellidoMaterno) {
      condiciones.push(like(pacienteDato.apellidoMaterno, `%${apellidoMaterno}%`));
    }

    const resultados = await db
      .select({
        documentoNumero: paciente.documentoNumero,
        nombres: pacienteDato.nombres,
        apellidoPaterno: pacienteDato.apellidoPaterno,
        apellidoMaterno: pacienteDato.apellidoMaterno,
        observacion: paciente.observacion,
        fechaNacimiento: pacienteDato.fechaNacimiento,
        sexo: pacienteDato.sexo,
        telefono: pacienteDato.telefono,
        ubigeoinei: sql<string>`(SELECT TOP 1 RTRIM(CODUBIGEO) FROM ASISTENCIAL.PACIENTEUBIGEO WHERE IDPACIENTE = ${paciente.idpaciente} AND ORIGEN = 'DOMICILIO')`,
        direccion: sql<string>`(SELECT TOP 1 DIRECCION FROM ASISTENCIAL.PACIENTEUBIGEO WHERE IDPACIENTE = ${paciente.idpaciente} AND ORIGEN = 'DOMICILIO')`,
      })
      .from(paciente)
      .innerJoin(pacienteDato, eq(paciente.idpaciente, pacienteDato.idpaciente))
      .where(and(...condiciones));
      
    return NextResponse.json({ success: true, data: resultados });
  } catch (error: any) {
    console.error("Error searching pacientes:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
