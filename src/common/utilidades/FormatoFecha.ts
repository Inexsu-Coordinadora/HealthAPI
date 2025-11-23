// ESTO ES UN ARCHIVO DE UTILIDAD PARA DARLE UN MISMO FORMATO A LAS FECHAS Y HORAS EN TODA LA APP

export class FechaUtil {
    static toISO(fecha: Date): string {
        return fecha.toISOString();
    }

    static obtenerDiaSemana(fecha: Date): string {
    const dias = [
        "domingo",
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado",
    ] as const;

    const dia = dias[fecha.getDay()];

    if (!dia) {
        throw new Error("Índice de día inválido");
    }

    return dia;
}

    static extraerHora(fecha: Date): string {
        const horas = fecha.getUTCHours().toString().padStart(2, "0");
        const minutos = fecha.getUTCMinutes().toString().padStart(2, "0");
        const segundos = fecha.getUTCSeconds().toString().padStart(2, "0");
        return `${horas}:${minutos}:${segundos}`;
    }

    static horaEnRango(hora: string, horaInicio: string, horaFin: string): boolean {
    const convertirAMinutos = (h: string): number => {
        const partes = h.split(":");
        if (partes.length < 2) {
            throw new Error(`Formato de hora inválido: ${h}`);
        }

        const horas = Number(partes[0]);
        const minutos = Number(partes[1]);

        return horas * 60 + minutos;
    };

    const minutosHora = convertirAMinutos(hora);
    const minutosInicio = convertirAMinutos(horaInicio);
    const minutosFin = convertirAMinutos(horaFin);

    return minutosHora >= minutosInicio && minutosHora < minutosFin;
    
    }

    static validarCitaConDisponibilidad(
        fechaCita: Date,
        diaSemanaDisponibilidad: string,
        horaInicio: string,
        horaFin: string
    ): boolean {
        // Verificar que el día de la semana coincida
        const diaCita = this.obtenerDiaSemana(fechaCita);
        if (diaCita.toLowerCase() !== diaSemanaDisponibilidad.toLowerCase()) {
            return false;
        }

        // Verificar que la hora esté dentro del rango
        const horaCita = this.extraerHora(fechaCita);
        return this.horaEnRango(horaCita, horaInicio, horaFin);
    }

    static formatearParaMostrar(fecha: Date): string {
        const dia = fecha.getUTCDate().toString().padStart(2, "0");
        const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, "0");
        const año = fecha.getUTCFullYear();
        const hora = fecha.getUTCHours().toString().padStart(2, "0");
        const minutos = fecha.getUTCMinutes().toString().padStart(2, "0");
        
        return `${dia}/${mes}/${año} ${hora}:${minutos}`;
    }

    static esFechaFutura(fecha: Date): boolean {
        return fecha > new Date();
    }

    static normalizarFecha(fecha: Date): Date {
        const nueva = new Date(fecha);
        nueva.setSeconds(0, 0);
        return nueva;
    }
}