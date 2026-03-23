import { int, varchar, char, datetime, bit, mssqlTable, mssqlSchema } from "drizzle-orm/mssql-core";

export const asistencialSchema = mssqlSchema('ASISTENCIAL');

export const paciente = asistencialSchema.table("PACIENTE", {
  idpaciente: int("IDPACIENTE").primaryKey(),
  nn: bit("NN").notNull(),
  nnEdad: int("NNEDAD"),
  nnSexo: char("NNSEXO", { length: 1 }),
  digitado: bit("DIGITADO").notNull(),
  documento: varchar("DOCUMENTO", { length: 50 }).notNull(),
  documentoNumero: varchar("DOCUMENTONUMERO", { length: 15 }).notNull(),
  seguroNumero: varchar("SEGURONUMERO", { length: 50 }).notNull().default(""),
  seguroTipo: varchar("SEGUROTIPO", { length: 100 }).notNull().default(""),
  tutor: bit("TUTOR").notNull().default(false),
  descripcion: varchar("DESCRIPCION", { length: -1 }).notNull().default(""),
  observacion: varchar("OBSERVACION", { length: -1 }).notNull(),
  estado: varchar("ESTADO", { length: 50 }).notNull(),
  codUsuario: char("CODUSUARIO", { length: 12 }),
  fechaHora: datetime("FECHAHORA"),
  codUsuario2: char("CODUSUARIO2", { length: 12 }),
  fechaHora2: datetime("FECHAHORA2"),
  indiceTabla: int("INDICETABLA").notNull(),
});

export const pacienteDato = asistencialSchema.table("PACIENTEDATO", {
  idpaciente: int("IDPACIENTE").primaryKey(), // Using this as PK for mapping since it's a 1:1 relation usually
  apellidoPaterno: varchar("APELLIDOPATERNO", { length: 50 }).notNull(),
  apellidoMaterno: varchar("APELLIDOMATERNO", { length: 50 }).notNull(),
  nombres: varchar("NOMBRES", { length: 50 }).notNull(),
  fechaNacimiento: datetime("FECHANACIMIENTO").notNull(),
  sexo: char("SEXO", { length: 1 }).notNull(),
  telefono: varchar("TELEFONO", { length: 50 }).notNull(),
  codPais: char("CODPAIS", { length: 3 }).notNull(),
  estadoCivil: varchar("ESTADOCIVIL", { length: 50 }).notNull(),
  estado: varchar("ESTADO", { length: 50 }).notNull(),
  codUsuario: char("CODUSUARIO", { length: 12 }),
  fechaHora: datetime("FECHAHORA"),
  codUsuario2: char("CODUSUARIO2", { length: 12 }),
  fechaHora2: datetime("FECHAHORA2"),
  indiceTabla: int("INDICETABLA").notNull(),
});

export const sitesisSchema = mssqlSchema('SITESIS');

export const procedimientos = sitesisSchema.table("PROCEDIMIENTOS", {
  codigo: varchar("CODIGO", { length: 15 }).primaryKey(),
  nombre: varchar("NOMBRE", { length: -1 }).notNull(),
  activo: bit("ACTIVO").notNull(),
});

export const diagnosticos = sitesisSchema.table("DIAGNOSTICOS", {
  codigo: varchar("CODIGO", { length: 15 }).primaryKey(),
  nombre: varchar("NOMBRE", { length: -1 }).notNull(),
  activo: bit("ACTIVO").notNull(),
});
