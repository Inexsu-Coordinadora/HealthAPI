import { Disponibilidad } from "../../src/core/dominio/disponibilidad/Disponibilidad.js";

describe("Disponibilidad - Validaciones Unitarias", () => {
    describe("validarDiaSemana", () => {
        test("debería aceptar días válidos sin tilde", () => {
            expect(Disponibilidad.validarDiaSemana("lunes")).toBe(true);
            expect(Disponibilidad.validarDiaSemana("martes")).toBe(true);
            expect(Disponibilidad.validarDiaSemana("miercoles")).toBe(true);
            expect(Disponibilidad.validarDiaSemana("jueves")).toBe(true);
            expect(Disponibilidad.validarDiaSemana("viernes")).toBe(true);
            expect(Disponibilidad.validarDiaSemana("sabado")).toBe(true);
            expect(Disponibilidad.validarDiaSemana("domingo")).toBe(true);
        });

        test("debería aceptar días válidos con tilde", () => {
            expect(Disponibilidad.validarDiaSemana("miércoles")).toBe(true);
            expect(Disponibilidad.validarDiaSemana("sábado")).toBe(true);
        });

        test("debería aceptar días en mayúsculas", () => {
            expect(Disponibilidad.validarDiaSemana("LUNES")).toBe(true);
            expect(Disponibilidad.validarDiaSemana("Martes")).toBe(true);
            expect(Disponibilidad.validarDiaSemana("MIÉRCOLES")).toBe(true);
        });

        test("debería rechazar días inválidos", () => {
            expect(Disponibilidad.validarDiaSemana("lunees")).toBe(false);
            expect(Disponibilidad.validarDiaSemana("monday")).toBe(false);
            expect(Disponibilidad.validarDiaSemana("")).toBe(false);
            expect(Disponibilidad.validarDiaSemana("123")).toBe(false);
            expect(Disponibilidad.validarDiaSemana("lu nes")).toBe(false);
        });
    });

    describe("validarFormatoHora", () => {
        test("debería aceptar formato HH:MM válido", () => {
            expect(Disponibilidad.validarFormatoHora("08:00")).toBe(true);
            expect(Disponibilidad.validarFormatoHora("14:30")).toBe(true);
            expect(Disponibilidad.validarFormatoHora("23:59")).toBe(true);
            expect(Disponibilidad.validarFormatoHora("00:00")).toBe(true);
        });

        test("debería aceptar formato HH:MM:SS válido", () => {
            expect(Disponibilidad.validarFormatoHora("08:00:00")).toBe(true);
            expect(Disponibilidad.validarFormatoHora("14:30:45")).toBe(true);
            expect(Disponibilidad.validarFormatoHora("23:59:59")).toBe(true);
            expect(Disponibilidad.validarFormatoHora("00:00:00")).toBe(true);
        });

        test("debería aceptar horas de un dígito", () => {
            expect(Disponibilidad.validarFormatoHora("8:00")).toBe(true);
            expect(Disponibilidad.validarFormatoHora("9:30")).toBe(true);
            expect(Disponibilidad.validarFormatoHora("1:15:30")).toBe(true);
        });

        test("debería rechazar horas mayores a 23", () => {
            expect(Disponibilidad.validarFormatoHora("24:00")).toBe(false);
            expect(Disponibilidad.validarFormatoHora("25:30")).toBe(false);
            expect(Disponibilidad.validarFormatoHora("99:00")).toBe(false);
        });

        test("debería rechazar minutos mayores a 59", () => {
            expect(Disponibilidad.validarFormatoHora("08:60")).toBe(false);
            expect(Disponibilidad.validarFormatoHora("14:75")).toBe(false);
            expect(Disponibilidad.validarFormatoHora("23:99")).toBe(false);
        });

        test("debería rechazar segundos mayores a 59", () => {
            expect(Disponibilidad.validarFormatoHora("08:00:60")).toBe(false);
            expect(Disponibilidad.validarFormatoHora("14:30:75")).toBe(false);
            expect(Disponibilidad.validarFormatoHora("23:59:99")).toBe(false);
        });

        test("debería rechazar formatos incorrectos", () => {
            expect(Disponibilidad.validarFormatoHora("8")).toBe(false);
            expect(Disponibilidad.validarFormatoHora("8:0")).toBe(false);
            expect(Disponibilidad.validarFormatoHora("08:00:0")).toBe(false);
            expect(Disponibilidad.validarFormatoHora("8:00 AM")).toBe(false);
            expect(Disponibilidad.validarFormatoHora("08-00")).toBe(false);
            expect(Disponibilidad.validarFormatoHora("")).toBe(false);
            expect(Disponibilidad.validarFormatoHora("abc:def")).toBe(false);
        });
    });

    describe("validarRangoHorario", () => {
        test("debería aceptar horaInicio < horaFin", () => {
            expect(Disponibilidad.validarRangoHorario("08:00", "09:00")).toBe(
                true
            );
            expect(Disponibilidad.validarRangoHorario("14:00", "16:30")).toBe(
                true
            );
            expect(Disponibilidad.validarRangoHorario("08:00", "17:00")).toBe(
                true
            );
        });

        test("debería aceptar rango con diferencia de minutos", () => {
            expect(Disponibilidad.validarRangoHorario("08:00", "08:30")).toBe(
                true
            );
            expect(Disponibilidad.validarRangoHorario("14:15", "14:45")).toBe(
                true
            );
        });

        test("debería rechazar horaInicio = horaFin", () => {
            expect(Disponibilidad.validarRangoHorario("08:00", "08:00")).toBe(
                false
            );
            expect(Disponibilidad.validarRangoHorario("14:30", "14:30")).toBe(
                false
            );
        });

        test("debería rechazar horaInicio > horaFin", () => {
            expect(Disponibilidad.validarRangoHorario("09:00", "08:00")).toBe(
                false
            );
            expect(Disponibilidad.validarRangoHorario("16:30", "14:00")).toBe(
                false
            );
            expect(Disponibilidad.validarRangoHorario("17:00", "08:00")).toBe(
                false
            );
        });

        test("debería manejar formato HH:MM:SS", () => {
            expect(
                Disponibilidad.validarRangoHorario("08:00:00", "09:00:00")
            ).toBe(true);
            expect(
                Disponibilidad.validarRangoHorario("08:00:30", "08:00:15")
            ).toBe(false);
        });

        test("debería rechazar formatos incompletos", () => {
            expect(Disponibilidad.validarRangoHorario("8", "9")).toBe(false);
            expect(Disponibilidad.validarRangoHorario("08:", "09:")).toBe(
                false
            );
            expect(Disponibilidad.validarRangoHorario("", "")).toBe(false);
        });

        test("debería validar rangos que cruzan mediodía", () => {
            expect(Disponibilidad.validarRangoHorario("11:00", "13:00")).toBe(
                true
            );
            expect(Disponibilidad.validarRangoHorario("08:00", "18:00")).toBe(
                true
            );
        });
    });

    describe("crear", () => {
        test("debería crear una disponibilidad con id null", () => {
            const disponibilidad = Disponibilidad.crear(
                1,
                "lunes",
                "08:00",
                "12:00"
            );

            expect(disponibilidad.idDisponibilidad).toBeNull();
            expect(disponibilidad.idMedico).toBe(1);
            expect(disponibilidad.diaSemana).toBe("lunes");
            expect(disponibilidad.horaInicio).toBe("08:00");
            expect(disponibilidad.horaFin).toBe("12:00");
            expect(disponibilidad.idConsultorio).toBeNull();
        });

        test("debería crear una disponibilidad con consultorio", () => {
            const disponibilidad = Disponibilidad.crear(
                1,
                "martes",
                "14:00",
                "18:00",
                5
            );

            expect(disponibilidad.idDisponibilidad).toBeNull();
            expect(disponibilidad.idMedico).toBe(1);
            expect(disponibilidad.idConsultorio).toBe(5);
            expect(disponibilidad.diaSemana).toBe("martes");
        });
    });

    describe("desdeBD", () => {
        test("debería crear una disponibilidad desde BD con todos los datos", () => {
            const disponibilidad = Disponibilidad.desdeBD(
                10,
                1,
                "miércoles",
                "08:00",
                "12:00",
                3
            );

            expect(disponibilidad.idDisponibilidad).toBe(10);
            expect(disponibilidad.idMedico).toBe(1);
            expect(disponibilidad.idConsultorio).toBe(3);
            expect(disponibilidad.diaSemana).toBe("miércoles");
            expect(disponibilidad.horaInicio).toBe("08:00");
            expect(disponibilidad.horaFin).toBe("12:00");
        });

        test("debería crear disponibilidad sin consultorio desde BD", () => {
            const disponibilidad = Disponibilidad.desdeBD(
                10,
                1,
                "jueves",
                "08:00",
                "12:00"
            );

            expect(disponibilidad.idConsultorio).toBeNull();
        });
    });

    describe("toObject", () => {
        test("debería convertir disponibilidad a objeto plano", () => {
            const disponibilidad = Disponibilidad.crear(
                1,
                "viernes",
                "08:00",
                "12:00",
                5
            );
            const objeto = disponibilidad.toObject();

            expect(objeto).toEqual({
                idDisponibilidad: null,
                idMedico: 1,
                idConsultorio: 5,
                diaSemana: "viernes",
                horaInicio: "08:00",
                horaFin: "12:00",
            });
        });
    });
});
