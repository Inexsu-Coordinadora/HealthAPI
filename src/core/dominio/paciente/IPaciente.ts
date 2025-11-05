export interface IPaciente {
    idPaciente?: number | null;
    nombrePaciente: string;
    correoPaciente: string;
    telefonoPaciente?: string | null;
}

export interface IPacienteActualizar {
    nombrePaciente?: string | undefined;
    correoPaciente?: string | undefined;
    telefonoPaciente?: string | undefined;
}
