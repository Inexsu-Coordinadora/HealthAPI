import { DisponibilidadServicio } from "../../src/core/aplicacion/casos-uso-disponibilidad/DisponibilidadServicio.js";
import type { IDisponibilidadRepositorio } from "../../src/core/dominio/disponibilidad/repositorio/IDisponibilidadRepositorio.js";
import type { IDisponibilidad } from "../../src/core/dominio/disponibilidad/IDisponibilidad.js";

describe("DisponibilidadServicio - Pruebas de Integración", () => {
    let servicio: DisponibilidadServicio;
    let mockRepositorio: jest.Mocked<IDisponibilidadRepositorio>;

    beforeEach(() => {
        mockRepositorio = {
            crearDisponibilidad: jest.fn(),
            obtenerDisponibilidadPorId: jest.fn(),
            listarDisponibilidades: jest.fn(),
            obtenerDisponibilidadesPorMedico: jest.fn(),
            obtenerDisponibilidadesPorConsultorio: jest.fn(),
            actualizarDisponibilidad: jest.fn(),
            eliminarDisponibilidad: jest.fn(),
            verificarDisponibilidadDuplicada: jest.fn(),
            verificarConflictoMedicoEnOtroConsultorio: jest.fn(),
            verificarConflictoConsultorioOcupado: jest.fn(),
        } as jest.Mocked<IDisponibilidadRepositorio>;

        servicio = new DisponibilidadServicio(mockRepositorio);
    });

    describe("crearDisponibilidad", () => {
        const datosDisponibilidad = {
            idMedico: 1,
            idConsultorio: 5,
            diaSemana: "lunes",
            horaInicio: "08:00",
            horaFin: "12:00",
        };

        test("debería crear disponibilidad cuando no hay conflictos", async () => {
            mockRepositorio.verificarDisponibilidadDuplicada.mockResolvedValue(
                false
            );
            mockRepositorio.verificarConflictoMedicoEnOtroConsultorio.mockResolvedValue(
                false
            );
            mockRepositorio.verificarConflictoConsultorioOcupado.mockResolvedValue(
                false
            );
            mockRepositorio.crearDisponibilidad.mockResolvedValue({
                idDisponibilidad: 1,
                ...datosDisponibilidad,
            });

            const resultado =
                await servicio.crearDisponibilidad(datosDisponibilidad);

            expect(resultado.idDisponibilidad).toBe(1);
            expect(
                mockRepositorio.verificarDisponibilidadDuplicada
            ).toHaveBeenCalledWith(1, 5, "lunes", "08:00", "12:00");
            expect(
                mockRepositorio.verificarConflictoMedicoEnOtroConsultorio
            ).toHaveBeenCalledWith(1, 5, "lunes", "08:00", "12:00");
            expect(
                mockRepositorio.verificarConflictoConsultorioOcupado
            ).toHaveBeenCalledWith(5, "lunes", "08:00", "12:00");
            expect(mockRepositorio.crearDisponibilidad).toHaveBeenCalled();
        });

        test("debería rechazar disponibilidad duplicada exacta", async () => {
            mockRepositorio.verificarDisponibilidadDuplicada.mockResolvedValue(
                true
            );

            await expect(
                servicio.crearDisponibilidad(datosDisponibilidad)
            ).rejects.toThrow(
                "Ya existe una disponibilidad idéntica para este médico en el mismo horario"
            );

            expect(
                mockRepositorio.verificarConflictoMedicoEnOtroConsultorio
            ).not.toHaveBeenCalled();
            expect(
                mockRepositorio.verificarConflictoConsultorioOcupado
            ).not.toHaveBeenCalled();
            expect(mockRepositorio.crearDisponibilidad).not.toHaveBeenCalled();
        });

        test("debería rechazar cuando médico está en otro consultorio al mismo tiempo", async () => {
            mockRepositorio.verificarDisponibilidadDuplicada.mockResolvedValue(
                false
            );
            mockRepositorio.verificarConflictoMedicoEnOtroConsultorio.mockResolvedValue(
                true
            );

            await expect(
                servicio.crearDisponibilidad(datosDisponibilidad)
            ).rejects.toThrow(
                "El médico ya tiene disponibilidad en otro consultorio en este horario"
            );

            expect(
                mockRepositorio.verificarConflictoConsultorioOcupado
            ).not.toHaveBeenCalled();
            expect(mockRepositorio.crearDisponibilidad).not.toHaveBeenCalled();
        });

        test("debería rechazar cuando consultorio está ocupado por otro médico", async () => {
            mockRepositorio.verificarDisponibilidadDuplicada.mockResolvedValue(
                false
            );
            mockRepositorio.verificarConflictoMedicoEnOtroConsultorio.mockResolvedValue(
                false
            );
            mockRepositorio.verificarConflictoConsultorioOcupado.mockResolvedValue(
                true
            );

            await expect(
                servicio.crearDisponibilidad(datosDisponibilidad)
            ).rejects.toThrow(
                "El consultorio ya está ocupado por otro médico en este horario"
            );

            expect(mockRepositorio.crearDisponibilidad).not.toHaveBeenCalled();
        });

        test("debería permitir crear disponibilidad sin consultorio", async () => {
            const datosSinConsultorio = {
                idMedico: 1,
                diaSemana: "martes",
                horaInicio: "14:00",
                horaFin: "18:00",
                idConsultorio: null,
            };

            mockRepositorio.verificarDisponibilidadDuplicada.mockResolvedValue(
                false
            );
            mockRepositorio.verificarConflictoMedicoEnOtroConsultorio.mockResolvedValue(
                false
            );
            mockRepositorio.crearDisponibilidad.mockResolvedValue({
                idDisponibilidad: 2,
                ...datosSinConsultorio,
            });

            const resultado =
                await servicio.crearDisponibilidad(datosSinConsultorio);

            expect(resultado.idDisponibilidad).toBe(2);
            expect(resultado.idConsultorio).toBeNull();
            // No se debe llamar verificarConflictoConsultorioOcupado cuando idConsultorio es null
            expect(
                mockRepositorio.verificarConflictoConsultorioOcupado
            ).not.toHaveBeenCalled();
        });

        test("debería validar orden correcto: duplicado -> médico -> consultorio", async () => {
            const orden: string[] = [];

            mockRepositorio.verificarDisponibilidadDuplicada.mockImplementation(
                async () => {
                    orden.push("duplicado");
                    return false;
                }
            );
            mockRepositorio.verificarConflictoMedicoEnOtroConsultorio.mockImplementation(
                async () => {
                    orden.push("medico");
                    return false;
                }
            );
            mockRepositorio.verificarConflictoConsultorioOcupado.mockImplementation(
                async () => {
                    orden.push("consultorio");
                    return false;
                }
            );
            mockRepositorio.crearDisponibilidad.mockResolvedValue({
                idDisponibilidad: 1,
                ...datosDisponibilidad,
            });

            await servicio.crearDisponibilidad(datosDisponibilidad);

            expect(orden).toEqual(["duplicado", "medico", "consultorio"]);
        });
    });

    describe("actualizarDisponibilidad", () => {
        const disponibilidadExistente: IDisponibilidad = {
            idDisponibilidad: 1,
            idMedico: 1,
            idConsultorio: 5,
            diaSemana: "lunes",
            horaInicio: "08:00",
            horaFin: "12:00",
        };

        test("debería retornar null si la disponibilidad no existe", async () => {
            mockRepositorio.obtenerDisponibilidadPorId.mockResolvedValue(null);

            const resultado = await servicio.actualizarDisponibilidad(999, {
                horaInicio: "09:00",
            });

            expect(resultado).toBeNull();
            expect(
                mockRepositorio.verificarConflictoMedicoEnOtroConsultorio
            ).not.toHaveBeenCalled();
        });

        test("debería actualizar sin validaciones cuando no cambian horarios ni consultorio", async () => {
            mockRepositorio.obtenerDisponibilidadPorId.mockResolvedValue(
                disponibilidadExistente
            );
            mockRepositorio.actualizarDisponibilidad.mockResolvedValue({
                ...disponibilidadExistente,
                idMedico: 2,
            });

            const resultado = await servicio.actualizarDisponibilidad(1, {
                idMedico: 2,
            });

            expect(resultado?.idMedico).toBe(2);
            expect(
                mockRepositorio.verificarConflictoMedicoEnOtroConsultorio
            ).not.toHaveBeenCalled();
            expect(
                mockRepositorio.verificarConflictoConsultorioOcupado
            ).not.toHaveBeenCalled();
        });

        test("debería validar conflictos cuando se actualiza horaInicio", async () => {
            mockRepositorio.obtenerDisponibilidadPorId.mockResolvedValue(
                disponibilidadExistente
            );
            mockRepositorio.verificarConflictoMedicoEnOtroConsultorio.mockResolvedValue(
                false
            );
            mockRepositorio.verificarConflictoConsultorioOcupado.mockResolvedValue(
                false
            );
            mockRepositorio.actualizarDisponibilidad.mockResolvedValue({
                ...disponibilidadExistente,
                horaInicio: "09:00",
            });

            const resultado = await servicio.actualizarDisponibilidad(1, {
                horaInicio: "09:00",
            });

            expect(resultado?.horaInicio).toBe("09:00");
            expect(
                mockRepositorio.verificarConflictoMedicoEnOtroConsultorio
            ).toHaveBeenCalledWith(1, 5, "lunes", "09:00", "12:00", 1);
            expect(
                mockRepositorio.verificarConflictoConsultorioOcupado
            ).toHaveBeenCalledWith(5, "lunes", "09:00", "12:00", 1);
        });

        test("debería rechazar actualización si médico estaría en otro consultorio", async () => {
            mockRepositorio.obtenerDisponibilidadPorId.mockResolvedValue(
                disponibilidadExistente
            );
            mockRepositorio.verificarConflictoMedicoEnOtroConsultorio.mockResolvedValue(
                true
            );

            await expect(
                servicio.actualizarDisponibilidad(1, { idConsultorio: 3 })
            ).rejects.toThrow(
                "El médico ya tiene disponibilidad en otro consultorio en este horario"
            );

            expect(
                mockRepositorio.actualizarDisponibilidad
            ).not.toHaveBeenCalled();
        });

        test("debería rechazar actualización si consultorio estaría ocupado", async () => {
            mockRepositorio.obtenerDisponibilidadPorId.mockResolvedValue(
                disponibilidadExistente
            );
            mockRepositorio.verificarConflictoMedicoEnOtroConsultorio.mockResolvedValue(
                false
            );
            mockRepositorio.verificarConflictoConsultorioOcupado.mockResolvedValue(
                true
            );

            await expect(
                servicio.actualizarDisponibilidad(1, { diaSemana: "martes" })
            ).rejects.toThrow(
                "El consultorio ya está ocupado por otro médico en este horario"
            );

            expect(
                mockRepositorio.actualizarDisponibilidad
            ).not.toHaveBeenCalled();
        });

        test("debería excluir el registro actual en las validaciones (parámetro idExcluir)", async () => {
            mockRepositorio.obtenerDisponibilidadPorId.mockResolvedValue(
                disponibilidadExistente
            );
            mockRepositorio.verificarConflictoMedicoEnOtroConsultorio.mockResolvedValue(
                false
            );
            mockRepositorio.verificarConflictoConsultorioOcupado.mockResolvedValue(
                false
            );
            mockRepositorio.actualizarDisponibilidad.mockResolvedValue({
                ...disponibilidadExistente,
                horaFin: "13:00",
            });

            await servicio.actualizarDisponibilidad(1, { horaFin: "13:00" });

            // Verificar que se pasa el ID 1 como parámetro de exclusión
            expect(
                mockRepositorio.verificarConflictoMedicoEnOtroConsultorio
            ).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(Number),
                expect.any(String),
                expect.any(String),
                expect.any(String),
                1 // idExcluir debe ser 1
            );
            expect(
                mockRepositorio.verificarConflictoConsultorioOcupado
            ).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(String),
                expect.any(String),
                expect.any(String),
                1 // idExcluir debe ser 1
            );
        });
    });

    describe("obtenerDisponibilidadPorId", () => {
        test("debería retornar disponibilidad existente", async () => {
            const disponibilidad: IDisponibilidad = {
                idDisponibilidad: 1,
                idMedico: 1,
                idConsultorio: 5,
                diaSemana: "lunes",
                horaInicio: "08:00",
                horaFin: "12:00",
            };
            mockRepositorio.obtenerDisponibilidadPorId.mockResolvedValue(
                disponibilidad
            );

            const resultado = await servicio.obtenerDisponibilidadPorId(1);

            expect(resultado).toEqual(disponibilidad);
        });

        test("debería retornar null si no existe", async () => {
            mockRepositorio.obtenerDisponibilidadPorId.mockResolvedValue(null);

            const resultado = await servicio.obtenerDisponibilidadPorId(999);

            expect(resultado).toBeNull();
        });
    });

    describe("listarDisponibilidades", () => {
        test("debería retornar todas las disponibilidades", async () => {
            const disponibilidades: IDisponibilidad[] = [
                {
                    idDisponibilidad: 1,
                    idMedico: 1,
                    idConsultorio: 5,
                    diaSemana: "lunes",
                    horaInicio: "08:00",
                    horaFin: "12:00",
                },
                {
                    idDisponibilidad: 2,
                    idMedico: 2,
                    idConsultorio: 3,
                    diaSemana: "martes",
                    horaInicio: "14:00",
                    horaFin: "18:00",
                },
            ];
            mockRepositorio.listarDisponibilidades.mockResolvedValue(
                disponibilidades
            );

            const resultado = await servicio.listarDisponibilidades();

            expect(resultado).toEqual(disponibilidades);
            expect(resultado).toHaveLength(2);
        });
    });

    describe("obtenerDisponibilidadesPorMedico", () => {
        test("debería retornar disponibilidades del médico específico", async () => {
            const disponibilidades: IDisponibilidad[] = [
                {
                    idDisponibilidad: 1,
                    idMedico: 1,
                    idConsultorio: 5,
                    diaSemana: "lunes",
                    horaInicio: "08:00",
                    horaFin: "12:00",
                },
                {
                    idDisponibilidad: 2,
                    idMedico: 1,
                    idConsultorio: 3,
                    diaSemana: "martes",
                    horaInicio: "14:00",
                    horaFin: "18:00",
                },
            ];
            mockRepositorio.obtenerDisponibilidadesPorMedico.mockResolvedValue(
                disponibilidades
            );

            const resultado =
                await servicio.obtenerDisponibilidadesPorMedico(1);

            expect(resultado).toEqual(disponibilidades);
            expect(resultado.every((d) => d.idMedico === 1)).toBe(true);
        });
    });

    describe("obtenerDisponibilidadesPorConsultorio", () => {
        test("debería retornar disponibilidades del consultorio específico", async () => {
            const disponibilidades: IDisponibilidad[] = [
                {
                    idDisponibilidad: 1,
                    idMedico: 1,
                    idConsultorio: 5,
                    diaSemana: "lunes",
                    horaInicio: "08:00",
                    horaFin: "12:00",
                },
                {
                    idDisponibilidad: 2,
                    idMedico: 2,
                    idConsultorio: 5,
                    diaSemana: "martes",
                    horaInicio: "14:00",
                    horaFin: "18:00",
                },
            ];
            mockRepositorio.obtenerDisponibilidadesPorConsultorio.mockResolvedValue(
                disponibilidades
            );

            const resultado =
                await servicio.obtenerDisponibilidadesPorConsultorio(5);

            expect(resultado).toEqual(disponibilidades);
            expect(resultado.every((d) => d.idConsultorio === 5)).toBe(true);
        });
    });

    describe("eliminarDisponibilidad", () => {
        test("debería eliminar disponibilidad y retornar true", async () => {
            mockRepositorio.eliminarDisponibilidad.mockResolvedValue(true);

            const resultado = await servicio.eliminarDisponibilidad(1);

            expect(resultado).toBe(true);
            expect(mockRepositorio.eliminarDisponibilidad).toHaveBeenCalledWith(
                1
            );
        });

        test("debería retornar false si no existe disponibilidad", async () => {
            mockRepositorio.eliminarDisponibilidad.mockResolvedValue(false);

            const resultado = await servicio.eliminarDisponibilidad(999);

            expect(resultado).toBe(false);
        });
    });
});
