export interface ICitaMedicaConDetalles {
    idCita: number;
    fecha: Date;
    estado: string;
    motivo: string | null;
    observaciones: string;
    paciente: {
        idPaciente: number;
        nombrePaciente: string;
        correoPaciente: string;
    };
    medico: {
        idMedico: number;
        nombreMedico: string;
        especialidadMedico: string;
    };

    disponibilidad: {
        diaSemana: string;
        horaInicio: string;
        horaFin: string;
    };
};