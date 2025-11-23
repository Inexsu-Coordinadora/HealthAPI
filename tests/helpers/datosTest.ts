import type { IPaciente } from "../../src/core/dominio/paciente/IPaciente";
import type { IDisponibilidad } from "../../src/core/dominio/disponibilidad/IDisponibilidad";
import type { ICitaMedica } from "../../src/core/dominio/citaMedica/ICitaMedica";
import type { ICitaMedicaConDetalles } from "../../src/core/dominio/citaMedica/ICitaMedicaConDetalles";

/**
 * Paciente de prueba
 */
export const pacienteTest: IPaciente = {
    idPaciente: 1,
    nombrePaciente: "Juan Pérez Test",
    correoPaciente: "juan.test@example.com",
    telefonoPaciente: "3001234567",
};

/**
 * Paciente que no existe
 */
export const pacienteInexistente = {
    idPaciente: 999,
};

/**
 * Disponibilidad de prueba
 */
export const disponibilidadTest: IDisponibilidad = {
    idDisponibilidad: 1,
    idMedico: 1,
    idConsultorio: 1,
    diaSemana: "lunes",
    horaInicio: "08:00:00",
    horaFin: "12:00:00",
};

/**
 * Cita médica de prueba
 */
export const citaTest: ICitaMedica = {
    idCita: 1,
    idPaciente: 1,
    idDisponibilidad: 1,
    fecha: new Date("2025-11-17T10:00:00.000Z"), // Lunes a las 10:00
    estado: "programada",
    motivo: "Consulta general de prueba",
    observaciones: "Primera consulta de prueba",
};

/**
 * Cita con detalles de prueba
 */
export const citaConDetallesTest: ICitaMedicaConDetalles = {
    idCita: 1,
    fecha: new Date("2025-11-17T10:00:00.000Z"),
    estado: "programada",
    motivo: "Consulta general de prueba",
    observaciones: "Primera consulta de prueba",
    paciente: {
        idPaciente: 1,
        nombrePaciente: "Juan Pérez Test",
        correoPaciente: "juan.test@example.com",
    },
    medico: {
        idMedico: 1,
        nombreMedico: "Dr. Carlos López Test",
        especialidadMedico: "Cardiología",
    },
    disponibilidad: {
        diaSemana: "lunes",
        horaInicio: "08:00:00",
        horaFin: "12:00:00",
    },
};

/**
 * Segunda cita de prueba (diferente horario)
 */
export const citaTest2: ICitaMedicaConDetalles = {
    idCita: 2,
    fecha: new Date("2025-11-17T11:00:00.000Z"), // Lunes a las 11:00
    estado: "programada",
    motivo: "Seguimiento",
    observaciones: "Segunda consulta",
    paciente: {
        idPaciente: 1,
        nombrePaciente: "Juan Pérez Test",
        correoPaciente: "juan.test@example.com",
    },
    medico: {
        idMedico: 1,
        nombreMedico: "Dr. Carlos López Test",
        especialidadMedico: "Cardiología",
    },
    disponibilidad: {
        diaSemana: "lunes",
        horaInicio: "08:00:00",
        horaFin: "12:00:00",
    },
};