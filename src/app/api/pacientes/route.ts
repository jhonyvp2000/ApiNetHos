import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { paciente, pacienteDato } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const db = await getDb();
    
    // Example: Fetch top 10 patients joined with their data
    const pacientes = await db
      .select({
        id: paciente.idpaciente,
        documento: paciente.documento,
        nombres: pacienteDato.nombres,
        apellidoPaterno: pacienteDato.apellidoPaterno,
        apellidoMaterno: pacienteDato.apellidoMaterno,
        fechaNacimiento: pacienteDato.fechaNacimiento,
        sexo: pacienteDato.sexo,
      })
      .from(paciente)
      .innerJoin(pacienteDato, eq(paciente.idpaciente, pacienteDato.idpaciente));
      
    return NextResponse.json({ success: true, data: pacientes.slice(0, 10) });
  } catch (error: any) {
    console.error("Error fetching pacientes:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
