import {
    CitaMedicaServicio,
    DisponibilidadOcupadaError,
    TraslapePacienteError,
    PacienteNoExisteError,
    DisponibilidadNoExisteError,
} from "../../src/core/aplicacion/casos-uso-cita/CitaMedicaServicio.js";
import type { ICitaMedicaRepositorio } from "../../src/core/dominio/citaMedica/repositorio/ICitaMedicaRepositorio.js";
import type { IDisponibilidadRepositorio } from "../../src/core/dominio/disponibilidad/repositorio/IDisponibilidadRepositorio.js";
import type { IPacienteRepositorio } from "../../src/core/dominio/paciente/repositorio/IPacienteRepositorio.js";
import type { ICitaMedica } from "../../src/core/dominio/citaMedica/ICitaMedica.js";
import type { IDisponibilidad } from "../../src/core/dominio/disponibilidad/IDisponibilidad.js";

const mockCitaMedicaRepositorio: jest.Mocked<ICitaMedicaRepositorio> = {
    crear: jest.fn(),
    obtenerCitaPorId: jest.fn(),
    listarCitas: jest.fn(),
    actualizarCita: jest.fn(),
    eliminarCita: jest.fn(),
    obtenerPorPaciente: jest.fn(),
    obtenerPorMedico: jest.fn(),
    obtenerPorEstado: jest.fn(),
    verificarPacienteExiste: jest.fn(),
    verificarMedicoExiste: jest.fn(),
    verificarConsultorioExiste: jest.fn(),
    verificarDisponibilidadExiste: jest.fn(),
    verificarDisponibilidadOcupada: jest.fn(),
    verificarTraslapePaciente: jest.fn(),
    obtenerCitasConDetallesPorPaciente: jest.fn(),
};

const mockDisponibilidadRepositorio: jest.Mocked<IDisponibilidadRepositorio> = {
    crearDisponibilidad: jest.fn(),
    obtenerDisponibilidadPorId: jest.fn(),
    listarDisponibilidades: jest.fn(),
    actualizarDisponibilidad: jest.fn(),
    eliminarDisponibilidad: jest.fn(),
    obtenerDisponibilidadesPorMedico: jest.fn(),
    obtenerDisponibilidadesPorConsultorio: jest.fn(),
    verificarDisponibilidadDuplicada: jest.fn(),
    verificarConflictoMedicoEnOtroConsultorio: jest.fn(),
    verificarConflictoConsultorioOcupado: jest.fn(),
};

const mockPacienteRepositorio: jest.Mocked<IPacienteRepositorio> = {
    crearPaciente: jest.fn(),
    obtenerPacientePorId: jest.fn(),
    listarPacientes: jest.fn(),
    actualizarPaciente: jest.fn(),
    eliminarPaciente: jest.fn(),
    obtenerPorCorreo: jest.fn(),
};

describe("CitaMedicaServicio - Tests Unitarios", () => {
    let servicio: CitaMedicaServicio;

    beforeEach(() => {
        jest.clearAllMocks();
        servicio = new CitaMedicaServicio(
            mockCitaMedicaRepositorio,
            mockDisponibilidadRepositorio,
            mockPacienteRepositorio
        );
    });

    describe("agendarCitaConValidacion", () => {
        const disponibilidadMock: IDisponibilidad = {
            idDisponibilidad: 1,
            idMedico: 10,
            idConsultorio: 5,
            diaSemana: "lunes",
            horaInicio: "09:00:00",
            horaFin: "13:00:00",
        };

        const fechaFutura = "2099-01-01T10:00:00";
        const datosCitaMock = {
            idPaciente: 1,
            idDisponibilidad: 1,
            fecha: fechaFutura,
            motivo: "Consulta general",
            observaciones: "Primera cita",
        };

        it("debería crear una cita exitosamente con todas las validaciones", async () => {
            const citaCreada: ICitaMedica = {
                idCita: 1,
                idPaciente: 1,
                idDisponibilidad: 1,
                fecha: new Date("2025-11-24T10:00:00"),
                estado: "programada",
                motivo: "Consulta general",
                observaciones: "Primera cita",
            };

            mockCitaMedicaRepositorio.verificarPacienteExiste.mockResolvedValue(
                true
            );
            mockDisponibilidadRepositorio.obtenerDisponibilidadPorId.mockResolvedValue(
                disponibilidadMock
            );
            mockCitaMedicaRepositorio.verificarDisponibilidadOcupada.mockResolvedValue(
                false
            );
            mockCitaMedicaRepositorio.verificarTraslapePaciente.mockResolvedValue(
                false
            );
            mockCitaMedicaRepositorio.crear.mockResolvedValue(citaCreada);

            const resultado =
                await servicio.agendarCitaConValidacion(datosCitaMock);

            expect(resultado).toEqual(citaCreada);
            expect(
                mockCitaMedicaRepositorio.verificarPacienteExiste
            ).toHaveBeenCalledWith(1);
            expect(
                mockDisponibilidadRepositorio.obtenerDisponibilidadPorId
            ).toHaveBeenCalledWith(1);
            expect(
                mockCitaMedicaRepositorio.verificarDisponibilidadOcupada
            ).toHaveBeenCalled();
            expect(
                mockCitaMedicaRepositorio.verificarTraslapePaciente
            ).toHaveBeenCalled();
        });

        it("debería lanzar PacienteNoExisteError si el paciente no existe", async () => {
            mockCitaMedicaRepositorio.verificarPacienteExiste.mockResolvedValue(
                false
            );

            await expect(
                servicio.agendarCitaConValidacion(datosCitaMock)
            ).rejects.toThrow(PacienteNoExisteError);
        });

        it("debería lanzar DisponibilidadNoExisteError si la disponibilidad no existe", async () => {
            mockCitaMedicaRepositorio.verificarPacienteExiste.mockResolvedValue(
                true
            );
            mockDisponibilidadRepositorio.obtenerDisponibilidadPorId.mockResolvedValue(
                null
            );

            await expect(
                servicio.agendarCitaConValidacion(datosCitaMock)
            ).rejects.toThrow(DisponibilidadNoExisteError);
        });

        it("debería lanzar DisponibilidadOcupadaError si la disponibilidad ya está ocupada", async () => {
            mockCitaMedicaRepositorio.verificarPacienteExiste.mockResolvedValue(
                true
            );
            mockDisponibilidadRepositorio.obtenerDisponibilidadPorId.mockResolvedValue(
                disponibilidadMock
            );
            mockCitaMedicaRepositorio.verificarDisponibilidadOcupada.mockResolvedValue(
                true
            );

            await expect(
                servicio.agendarCitaConValidacion(datosCitaMock)
            ).rejects.toThrow(DisponibilidadOcupadaError);
        });

        it("debería lanzar TraslapePacienteError si el paciente ya tiene una cita", async () => {
            mockCitaMedicaRepositorio.verificarPacienteExiste.mockResolvedValue(
                true
            );
            mockCitaMedicaRepositorio.verificarDisponibilidadExiste.mockResolvedValue(
                true
            );
            mockDisponibilidadRepositorio.obtenerDisponibilidadPorId.mockResolvedValue(
                disponibilidadMock
            );
            mockCitaMedicaRepositorio.verificarDisponibilidadOcupada.mockResolvedValue(
                false
            );
            mockCitaMedicaRepositorio.verificarTraslapePaciente.mockResolvedValue(
                true
            );

            await expect(
                servicio.agendarCitaConValidacion(datosCitaMock)
            ).rejects.toThrow(TraslapePacienteError);
        });

        it("debería aceptar fecha como Date o string", async () => {
            const datosConDate = {
                ...datosCitaMock,
                fecha: new Date("2025-11-24T10:00:00"),
            };

            mockCitaMedicaRepositorio.verificarPacienteExiste.mockResolvedValue(
                true
            );
            mockCitaMedicaRepositorio.verificarDisponibilidadExiste.mockResolvedValue(
                true
            );
            mockDisponibilidadRepositorio.obtenerDisponibilidadPorId.mockResolvedValue(
                disponibilidadMock
            );
            mockCitaMedicaRepositorio.verificarDisponibilidadOcupada.mockResolvedValue(
                false
            );
            mockCitaMedicaRepositorio.verificarTraslapePaciente.mockResolvedValue(
                false
            );
            mockCitaMedicaRepositorio.crear.mockResolvedValue({
                idCita: 1,
                idPaciente: 1,
                idDisponibilidad: 1,
                fecha: new Date("2025-11-24T10:00:00"),
                estado: "programada",
                motivo: "Consulta general",
                observaciones: "Primera cita",
            });

            const resultado =
                await servicio.agendarCitaConValidacion(datosConDate);

            expect(resultado).toBeDefined();
            expect(resultado.idCita).toBe(1);
        });

        it("debería crear cita con estado programada por defecto", async () => {
            const citaCreada: ICitaMedica = {
                idCita: 1,
                idPaciente: 1,
                idDisponibilidad: 1,
                fecha: new Date("2025-11-24T10:00:00"),
                estado: "programada",
                motivo: null,
                observaciones: "",
            };

            mockCitaMedicaRepositorio.verificarPacienteExiste.mockResolvedValue(
                true
            );
            mockCitaMedicaRepositorio.verificarDisponibilidadExiste.mockResolvedValue(
                true
            );
            mockDisponibilidadRepositorio.obtenerDisponibilidadPorId.mockResolvedValue(
                disponibilidadMock
            );
            mockCitaMedicaRepositorio.verificarDisponibilidadOcupada.mockResolvedValue(
                false
            );
            mockCitaMedicaRepositorio.verificarTraslapePaciente.mockResolvedValue(
                false
            );
            mockCitaMedicaRepositorio.crear.mockResolvedValue(citaCreada);

            const resultado =
                await servicio.agendarCitaConValidacion(datosCitaMock);

            expect(resultado.estado).toBe("programada");
        });
    });

    describe("CrearCitaMedica", () => {
        it("debería crear una cita validando disponibilidad", async () => {
            const disponibilidadMock: IDisponibilidad = {
                idDisponibilidad: 1,
                idMedico: 1,
                idConsultorio: 1,
                diaSemana: "jueves", // 2099-01-01 es jueves
                horaInicio: "09:00:00",
                horaFin: "13:00:00",
            };

            const citaMock: Omit<ICitaMedica, "idCita"> = {
                idPaciente: 1,
                idDisponibilidad: 1,
                fecha: new Date("2099-01-01T10:00:00.000Z"),
                estado: "programada",
                motivo: "Consulta",
                observaciones: "",
            };

            const citaCreada: ICitaMedica = { ...citaMock, idCita: 1 };

            mockPacienteRepositorio.obtenerPacientePorId.mockResolvedValue({
                idPaciente: 1,
                nombrePaciente: "Test",
                correoPaciente: "test@test.com",
                telefonoPaciente: "123456",
            });
            mockDisponibilidadRepositorio.obtenerDisponibilidadPorId.mockResolvedValue(
                disponibilidadMock
            );
            mockCitaMedicaRepositorio.crear.mockResolvedValue(citaCreada);

            const resultado = await servicio.CrearCitaMedica(citaMock);

            expect(resultado).toEqual(citaCreada);
        });

        it("debería lanzar DisponibilidadNoExisteError si disponibilidad no existe", async () => {
            const citaMock: Omit<ICitaMedica, "idCita"> = {
                idPaciente: 1,
                idDisponibilidad: 999,
                fecha: new Date("2099-01-01T10:00:00"),
                estado: "programada",
                motivo: "Consulta",
                observaciones: "",
            };

            mockPacienteRepositorio.obtenerPacientePorId.mockResolvedValue({
                idPaciente: 1,
                nombrePaciente: "Test",
                correoPaciente: "test@test.com",
                telefonoPaciente: "123456",
            });
            mockDisponibilidadRepositorio.obtenerDisponibilidadPorId.mockResolvedValue(
                null
            );

            await expect(servicio.CrearCitaMedica(citaMock)).rejects.toThrow(
                DisponibilidadNoExisteError
            );
        });
    });

    describe("obtenerCitaMedicaPorId", () => {
        it("debería retornar una cita por ID", async () => {
            const citaMock: ICitaMedica = {
                idCita: 1,
                idPaciente: 1,
                idDisponibilidad: 1,
                fecha: new Date("2025-11-24T10:00:00"),
                estado: "programada",
                motivo: "Consulta",
                observaciones: "",
            };

            mockCitaMedicaRepositorio.obtenerCitaPorId.mockResolvedValue(
                citaMock
            );

            const resultado = await servicio.obtenerCitaMedicaPorId(1);

            expect(resultado).toEqual(citaMock);
        });

        it("debería retornar null si la cita no existe", async () => {
            mockCitaMedicaRepositorio.obtenerCitaPorId.mockResolvedValue(null);

            const resultado = await servicio.obtenerCitaMedicaPorId(999);

            expect(resultado).toBeNull();
        });
    });

    describe("listarCitas", () => {
        it("debería retornar un array de citas", async () => {
            const citasMock: ICitaMedica[] = [
                {
                    idCita: 1,
                    idPaciente: 1,
                    idDisponibilidad: 1,
                    fecha: new Date("2025-11-24T10:00:00"),
                    estado: "programada",
                    motivo: "Consulta",
                    observaciones: "",
                },
            ];

            mockCitaMedicaRepositorio.listarCitas.mockResolvedValue(citasMock);

            const resultado = await servicio.listarCitas();

            expect(resultado).toEqual(citasMock);
            expect(resultado).toHaveLength(1);
        });
    });

    describe("actualizarCita", () => {
        it("debería actualizar una cita existente", async () => {
            const citaExistente: ICitaMedica = {
                idCita: 1,
                idPaciente: 1,
                idDisponibilidad: 1,
                fecha: new Date("2025-11-24T10:00:00"),
                estado: "programada",
                motivo: "Consulta",
                observaciones: "",
            };

            const datosActualizados = {
                estado: "realizada",
                observaciones: "Paciente atendido",
            };

            const citaActualizada = { ...citaExistente, ...datosActualizados };

            mockCitaMedicaRepositorio.obtenerCitaPorId.mockResolvedValue(
                citaExistente
            );
            mockCitaMedicaRepositorio.actualizarCita.mockResolvedValue(
                citaActualizada
            );

            const resultado = await servicio.actualizarCita(
                1,
                datosActualizados
            );

            expect(resultado).toEqual(citaActualizada);
        });

        it("debería retornar null si la cita no existe", async () => {
            mockCitaMedicaRepositorio.obtenerCitaPorId.mockResolvedValue(null);

            const resultado = await servicio.actualizarCita(999, {
                estado: "cancelada",
            });

            expect(resultado).toBeNull();
        });
    });

    describe("eliminarCitaMedica", () => {
        it("debería eliminar una cita exitosamente", async () => {
            const citaMock = {
                idCita: 1,
                idPaciente: 1,
                idDisponibilidad: 1,
                fecha: new Date(),
                estado: "programada" as const,
                motivo: "Test",
                observaciones: "",
            };
            mockCitaMedicaRepositorio.obtenerCitaPorId.mockResolvedValue(
                citaMock
            );
            mockCitaMedicaRepositorio.eliminarCita.mockResolvedValue(true);

            const resultado = await servicio.eliminarCitaMedica(1);

            expect(resultado).toBe(true);
        });

        it("debería lanzar error si la cita no existe", async () => {
            mockCitaMedicaRepositorio.obtenerCitaPorId.mockResolvedValue(null);

            await expect(servicio.eliminarCitaMedica(999)).rejects.toThrow(
                "No se encontró una cita con el ID 999"
            );
        });
    });

    describe("obtenerCitasPorPaciente", () => {
        it("debería retornar las citas de un paciente", async () => {
            const pacienteMock = {
                idPaciente: 1,
                nombrePaciente: "Juan Pérez",
                correoPaciente: "juan@email.com",
                telefonoPaciente: "123456",
            };

            const citasMock = [
                {
                    idCita: 1,
                    fecha: new Date("2025-11-24T10:00:00"),
                    estado: "programada",
                    motivo: "Consulta",
                    observaciones: "",
                    paciente: {
                        idPaciente: 1,
                        nombrePaciente: "Juan Pérez",
                        correoPaciente: "juan@email.com",
                    },
                    medico: {
                        idMedico: 1,
                        nombreMedico: "Dr. Smith",
                        especialidadMedico: "Cardiología",
                    },
                },
            ];

            mockPacienteRepositorio.obtenerPacientePorId.mockResolvedValue(
                pacienteMock
            );
            mockCitaMedicaRepositorio.obtenerCitasConDetallesPorPaciente.mockResolvedValue(
                citasMock
            );

            const resultado = await servicio.obtenerCitasPorPaciente(1);

            expect(resultado).toEqual(citasMock);
        });

        it("debería lanzar Error si el ID es inválido", async () => {
            await expect(servicio.obtenerCitasPorPaciente(0)).rejects.toThrow(
                "El ID del paciente debe ser un número positivo"
            );
            await expect(servicio.obtenerCitasPorPaciente(-1)).rejects.toThrow(
                "El ID del paciente debe ser un número positivo"
            );
        });

        it("debería lanzar Error si el paciente no existe", async () => {
            mockPacienteRepositorio.obtenerPacientePorId.mockResolvedValue(
                null
            );

            await expect(servicio.obtenerCitasPorPaciente(999)).rejects.toThrow(
                /paciente con ID 999 no existe/i
            );
        });
    });
});
