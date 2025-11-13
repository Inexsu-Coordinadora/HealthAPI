import type { IPaciente } from "./IPaciente.js";

export class Paciente implements IPaciente {
    idPaciente?: number | null;
    nombrePaciente: string;
    correoPaciente: string;
    telefonoPaciente?: string | null;

    constructor(datosPaciente: IPaciente) {
        this.idPaciente = datosPaciente.idPaciente ?? null;
        this.nombrePaciente = datosPaciente.nombrePaciente;
        this.correoPaciente = datosPaciente.correoPaciente;
        this.telefonoPaciente = datosPaciente.telefonoPaciente
            ? datosPaciente.telefonoPaciente
            : null;
    }

    static crear(nombre: string, correo: string, telefono: string): Paciente {
        return new Paciente({
            idPaciente: null,
            nombrePaciente: nombre,
            correoPaciente: correo,
            telefonoPaciente: telefono,
        });
    }

    // Para crear un paciente desde la BD (con ID)
    static desdeBD(
        id: number,
        nombre: string,
        correo: string,
        telefono: string
    ): Paciente {
        return new Paciente({
            idPaciente: id,
            nombrePaciente: nombre,
            correoPaciente: correo,
            telefonoPaciente: telefono,
        });
    }

    static validarCorreo(correo: string): boolean {
        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regexCorreo.test(correo);
    }

    static validarTelefono(telefono: string): boolean {
        return telefono.length >= 7;
    }

    toObject(): IPaciente {
        return {
            idPaciente: this.idPaciente ?? null,
            nombrePaciente: this.nombrePaciente,
            correoPaciente: this.correoPaciente,
            telefonoPaciente: this.telefonoPaciente
                ? this.telefonoPaciente
                : null,
        };
    }
}