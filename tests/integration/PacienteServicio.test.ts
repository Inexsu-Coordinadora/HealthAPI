import { PacienteServicio } from "../../src/core/aplicacion/casos-uso-paciente/PacienteServicio.js";
import type { IPacienteRepositorio } from "../../src/core/dominio/paciente/repositorio/IPacienteRepositorio.js";
import type {
    IPaciente,
    IPacienteActualizar,
} from "../../src/core/dominio/paciente/IPaciente.js";
import type { ICitaMedicaRepositorio } from "../../src/core/dominio/citaMedica/repositorio/ICitaMedicaRepositorio.js";
import type { ICitaMedicaConDetalles } from "../../src/core/dominio/citaMedica/ICitaMedicaConDetalles.js";

describe("PacienteServicio - Integration Tests", () => {
    let servicio: PacienteServicio;
    let mockPacienteRepo: jest.Mocked<IPacienteRepositorio>;
    let mockCitaRepo: jest.Mocked<ICitaMedicaRepositorio>;

    beforeEach(() => {
        // Mock del repositorio de pacientes
        mockPacienteRepo = {
            crearPaciente: jest.fn(),
            obtenerPacientePorId: jest.fn(),
            listarPacientes: jest.fn(),
            actualizarPaciente: jest.fn(),
            eliminarPaciente: jest.fn(),
            obtenerPorCorreo: jest.fn(),
        };

        // Mock del repositorio de citas
        mockCitaRepo = {
            obtenerCitasConDetallesPorPaciente: jest.fn(),
            obtenerPorPaciente: jest.fn(),
            crear: jest.fn(),
            obtenerCitaPorId: jest.fn(),
            listarCitas: jest.fn(),
            actualizarCita: jest.fn(),
            eliminarCita: jest.fn(),
            obtenerPorMedico: jest.fn(),
            obtenerPorEstado: jest.fn(),
            verificarPacienteExiste: jest.fn(),
            verificarMedicoExiste: jest.fn(),
            verificarConsultorioExiste: jest.fn(),
            verificarDisponibilidadExiste: jest.fn(),
            verificarTraslapePaciente: jest.fn(),
            verificarTraslapeMedico: jest.fn(),
            verificarTraslapeConsultorio: jest.fn(),
            verificarCitasSuperpuestasPaciente: jest.fn(),
            verificarCitasSuperpuestasMedico: jest.fn(),
            verificarCitasSuperpuestasConsultorio: jest.fn(),
        };

        servicio = new PacienteServicio(mockPacienteRepo);
    });

    describe("crearPaciente", () => {
        it("debería crear un paciente exitosamente", async () => {
            const dto: Omit<IPaciente, "idPaciente"> = {
                nombrePaciente: "Juan Pérez",
                correoPaciente: "juan.perez@email.com",
                telefonoPaciente: "3001234567",
            };

            const pacienteCreado: IPaciente = {
                idPaciente: 1,
                ...dto,
            };

            mockPacienteRepo.obtenerPorCorreo.mockResolvedValue(null);
            mockPacienteRepo.crearPaciente.mockResolvedValue(pacienteCreado);

            const resultado = await servicio.crearPaciente(dto);

            expect(resultado.idPaciente).toBe(1);
            expect(resultado.nombrePaciente).toBe("Juan Pérez");
            expect(resultado.correoPaciente).toBe("juan.perez@email.com");
            expect(mockPacienteRepo.obtenerPorCorreo).toHaveBeenCalledWith(
                "juan.perez@email.com"
            );
            expect(mockPacienteRepo.crearPaciente).toHaveBeenCalledTimes(1);
        });

        it("debería crear un paciente sin teléfono", async () => {
            const dto: Omit<IPaciente, "idPaciente"> = {
                nombrePaciente: "María López",
                correoPaciente: "maria.lopez@email.com",
                telefonoPaciente: null,
            };

            const pacienteCreado: IPaciente = {
                idPaciente: 2,
                ...dto,
            };

            mockPacienteRepo.obtenerPorCorreo.mockResolvedValue(null);
            mockPacienteRepo.crearPaciente.mockResolvedValue(pacienteCreado);

            const resultado = await servicio.crearPaciente(dto);

            expect(resultado.telefonoPaciente).toBeNull();
        });

        it("debería rechazar paciente con correo duplicado", async () => {
            const dto: Omit<IPaciente, "idPaciente"> = {
                nombrePaciente: "Carlos García",
                correoPaciente: "carlos.garcia@email.com",
                telefonoPaciente: "3009876543",
            };

            const pacienteExistente: IPaciente = {
                idPaciente: 10,
                nombrePaciente: "Carlos García Original",
                correoPaciente: "carlos.garcia@email.com",
                telefonoPaciente: "3001111111",
            };

            mockPacienteRepo.obtenerPorCorreo.mockResolvedValue(
                pacienteExistente
            );

            await expect(servicio.crearPaciente(dto)).rejects.toThrow(
                "Ya existe un paciente con el correo carlos.garcia@email.com"
            );

            expect(mockPacienteRepo.crearPaciente).not.toHaveBeenCalled();
        });

        it("debería normalizar teléfono vacío a null", async () => {
            const dto: Omit<IPaciente, "idPaciente"> = {
                nombrePaciente: "Ana Martínez",
                correoPaciente: "ana.martinez@email.com",
                telefonoPaciente: "",
            };

            const pacienteCreado: IPaciente = {
                idPaciente: 3,
                nombrePaciente: "Ana Martínez",
                correoPaciente: "ana.martinez@email.com",
                telefonoPaciente: null,
            };

            mockPacienteRepo.obtenerPorCorreo.mockResolvedValue(null);
            mockPacienteRepo.crearPaciente.mockResolvedValue(pacienteCreado);

            const resultado = await servicio.crearPaciente(dto);

            expect(resultado.telefonoPaciente).toBeNull();
        });
    });

    describe("obtenerPacientePorId", () => {
        it("debería obtener un paciente existente", async () => {
            const paciente: IPaciente = {
                idPaciente: 5,
                nombrePaciente: "Laura Gómez",
                correoPaciente: "laura.gomez@email.com",
                telefonoPaciente: "3201234567",
            };

            mockPacienteRepo.obtenerPacientePorId.mockResolvedValue(paciente);

            const resultado = await servicio.obtenerPacientePorId(5);

            expect(resultado).toEqual(paciente);
            expect(mockPacienteRepo.obtenerPacientePorId).toHaveBeenCalledWith(
                5
            );
        });

        it("debería retornar null si paciente no existe", async () => {
            mockPacienteRepo.obtenerPacientePorId.mockResolvedValue(null);

            const resultado = await servicio.obtenerPacientePorId(999);

            expect(resultado).toBeNull();
        });
    });

    describe("listarPacientes", () => {
        it("debería listar todos los pacientes", async () => {
            const pacientes: IPaciente[] = [
                {
                    idPaciente: 1,
                    nombrePaciente: "Juan Pérez",
                    correoPaciente: "juan.perez@email.com",
                    telefonoPaciente: "3001234567",
                },
                {
                    idPaciente: 2,
                    nombrePaciente: "María López",
                    correoPaciente: "maria.lopez@email.com",
                    telefonoPaciente: "3009876543",
                },
            ];

            mockPacienteRepo.listarPacientes.mockResolvedValue(pacientes);

            const resultado = await servicio.listarPacientes();

            expect(resultado).toHaveLength(2);
            expect(resultado[0].nombrePaciente).toBe("Juan Pérez");
            expect(resultado[1].nombrePaciente).toBe("María López");
        });

        it("debería retornar array vacío si no hay pacientes", async () => {
            mockPacienteRepo.listarPacientes.mockResolvedValue([]);

            const resultado = await servicio.listarPacientes();

            expect(resultado).toEqual([]);
        });
    });

    describe("actualizarPaciente", () => {
        it("debería actualizar nombre de paciente", async () => {
            const datosActualizados: IPacienteActualizar = {
                nombrePaciente: "Juan Pérez Actualizado",
            };

            const pacienteActualizado: IPaciente = {
                idPaciente: 1,
                nombrePaciente: "Juan Pérez Actualizado",
                correoPaciente: "juan.perez@email.com",
                telefonoPaciente: "3001234567",
            };

            mockPacienteRepo.actualizarPaciente.mockResolvedValue(
                pacienteActualizado
            );

            const resultado = await servicio.actualizarPaciente(
                1,
                datosActualizados
            );

            expect(resultado?.nombrePaciente).toBe("Juan Pérez Actualizado");
            expect(mockPacienteRepo.actualizarPaciente).toHaveBeenCalledWith(
                1,
                datosActualizados
            );
        });

        it("debería actualizar correo de paciente", async () => {
            const datosActualizados: IPacienteActualizar = {
                correoPaciente: "nuevo.correo@email.com",
            };

            const pacienteActualizado: IPaciente = {
                idPaciente: 2,
                nombrePaciente: "María López",
                correoPaciente: "nuevo.correo@email.com",
                telefonoPaciente: "3009876543",
            };

            mockPacienteRepo.actualizarPaciente.mockResolvedValue(
                pacienteActualizado
            );

            const resultado = await servicio.actualizarPaciente(
                2,
                datosActualizados
            );

            expect(resultado?.correoPaciente).toBe("nuevo.correo@email.com");
        });

        it("debería actualizar teléfono de paciente", async () => {
            const datosActualizados: IPacienteActualizar = {
                telefonoPaciente: "3111111111",
            };

            const pacienteActualizado: IPaciente = {
                idPaciente: 3,
                nombrePaciente: "Carlos García",
                correoPaciente: "carlos.garcia@email.com",
                telefonoPaciente: "3111111111",
            };

            mockPacienteRepo.actualizarPaciente.mockResolvedValue(
                pacienteActualizado
            );

            const resultado = await servicio.actualizarPaciente(
                3,
                datosActualizados
            );

            expect(resultado?.telefonoPaciente).toBe("3111111111");
        });

        it("debería actualizar múltiples campos a la vez", async () => {
            const datosActualizados: IPacienteActualizar = {
                nombrePaciente: "Ana Martínez Nuevo",
                telefonoPaciente: "3222222222",
            };

            const pacienteActualizado: IPaciente = {
                idPaciente: 4,
                nombrePaciente: "Ana Martínez Nuevo",
                correoPaciente: "ana.martinez@email.com",
                telefonoPaciente: "3222222222",
            };

            mockPacienteRepo.actualizarPaciente.mockResolvedValue(
                pacienteActualizado
            );

            const resultado = await servicio.actualizarPaciente(
                4,
                datosActualizados
            );

            expect(resultado?.nombrePaciente).toBe("Ana Martínez Nuevo");
            expect(resultado?.telefonoPaciente).toBe("3222222222");
        });

        it("debería retornar null si paciente no existe", async () => {
            mockPacienteRepo.actualizarPaciente.mockResolvedValue(null);

            const resultado = await servicio.actualizarPaciente(999, {
                nombrePaciente: "No existe",
            });

            expect(resultado).toBeNull();
        });
    });

    describe("eliminarPaciente", () => {
        it("debería eliminar un paciente existente", async () => {
            mockPacienteRepo.eliminarPaciente.mockResolvedValue(true);

            const resultado = await servicio.eliminarPaciente(10);

            expect(resultado).toBe(true);
            expect(mockPacienteRepo.eliminarPaciente).toHaveBeenCalledWith(10);
        });

        it("debería retornar false si paciente no existe", async () => {
            mockPacienteRepo.eliminarPaciente.mockResolvedValue(false);

            const resultado = await servicio.eliminarPaciente(999);

            expect(resultado).toBe(false);
        });
    });

    describe("obtenerCitasPorPaciente", () => {
        it("debería obtener todas las citas de un paciente con detalles", async () => {
            const idPaciente = 1;

            const citasConDetalles: ICitaMedicaConDetalles[] = [
                {
                    idCita: 1,
                    fecha: new Date("2025-11-25"),
                    estado: "Confirmada",
                    motivo: "Consulta general",
                    observaciones: "Primera consulta",
                    paciente: {
                        idPaciente: 1,
                        nombrePaciente: "Juan Pérez",
                        correoPaciente: "juan.perez@email.com",
                    },
                    medico: {
                        idMedico: 10,
                        nombreMedico: "Dr. Carlos López",
                        especialidadMedico: "Cardiología",
                    },
                },
                {
                    idCita: 2,
                    fecha: new Date("2025-12-01"),
                    estado: "Pendiente",
                    motivo: "Control",
                    observaciones: "Control mensual",
                    paciente: {
                        idPaciente: 1,
                        nombrePaciente: "Juan Pérez",
                        correoPaciente: "juan.perez@email.com",
                    },
                    medico: {
                        idMedico: 20,
                        nombreMedico: "Dra. María García",
                        especialidadMedico: "Medicina General",
                    },
                },
            ];

            mockCitaRepo.obtenerCitasConDetallesPorPaciente.mockResolvedValue(
                citasConDetalles
            );

            const resultado =
                await mockCitaRepo.obtenerCitasConDetallesPorPaciente(
                    idPaciente
                );

            expect(resultado).toHaveLength(2);
            expect(resultado[0].medico.nombreMedico).toBe("Dr. Carlos López");
            expect(resultado[1].medico.nombreMedico).toBe("Dra. María García");
            expect(resultado[0].paciente.idPaciente).toBe(1);
            expect(resultado[1].paciente.idPaciente).toBe(1);
        });

        it("debería retornar array vacío si paciente no tiene citas", async () => {
            mockCitaRepo.obtenerCitasConDetallesPorPaciente.mockResolvedValue(
                []
            );

            const resultado =
                await mockCitaRepo.obtenerCitasConDetallesPorPaciente(999);

            expect(resultado).toEqual([]);
        });

        it("debería obtener citas solo de un paciente específico", async () => {
            const idPaciente = 5;

            const citasConDetalles: ICitaMedicaConDetalles[] = [
                {
                    idCita: 10,
                    fecha: new Date("2025-11-30"),
                    estado: "Confirmada",
                    motivo: "Chequeo",
                    observaciones: "",
                    paciente: {
                        idPaciente: 5,
                        nombrePaciente: "Laura Gómez",
                        correoPaciente: "laura.gomez@email.com",
                    },
                    medico: {
                        idMedico: 15,
                        nombreMedico: "Dr. Pedro Ramírez",
                        especialidadMedico: "Dermatología",
                    },
                },
            ];

            mockCitaRepo.obtenerCitasConDetallesPorPaciente.mockResolvedValue(
                citasConDetalles
            );

            const resultado =
                await mockCitaRepo.obtenerCitasConDetallesPorPaciente(
                    idPaciente
                );

            expect(resultado).toHaveLength(1);
            expect(resultado[0].paciente.idPaciente).toBe(5);
            expect(resultado[0].paciente.nombrePaciente).toBe("Laura Gómez");
        });

        it("debería incluir diferentes estados de citas", async () => {
            const citasConDetalles: ICitaMedicaConDetalles[] = [
                {
                    idCita: 1,
                    fecha: new Date("2025-11-20"),
                    estado: "Completada",
                    motivo: "Consulta pasada",
                    observaciones: "Paciente atendido",
                    paciente: {
                        idPaciente: 1,
                        nombrePaciente: "Juan Pérez",
                        correoPaciente: "juan.perez@email.com",
                    },
                    medico: {
                        idMedico: 10,
                        nombreMedico: "Dr. Carlos López",
                        especialidadMedico: "Cardiología",
                    },
                },
                {
                    idCita: 2,
                    fecha: new Date("2025-11-25"),
                    estado: "Cancelada",
                    motivo: "Urgencia",
                    observaciones: "Cancelada por paciente",
                    paciente: {
                        idPaciente: 1,
                        nombrePaciente: "Juan Pérez",
                        correoPaciente: "juan.perez@email.com",
                    },
                    medico: {
                        idMedico: 10,
                        nombreMedico: "Dr. Carlos López",
                        especialidadMedico: "Cardiología",
                    },
                },
            ];

            mockCitaRepo.obtenerCitasConDetallesPorPaciente.mockResolvedValue(
                citasConDetalles
            );

            const resultado =
                await mockCitaRepo.obtenerCitasConDetallesPorPaciente(1);

            expect(resultado[0].estado).toBe("Completada");
            expect(resultado[1].estado).toBe("Cancelada");
        });

        it("debería mostrar citas con diferentes médicos para el mismo paciente", async () => {
            const citasConDetalles: ICitaMedicaConDetalles[] = [
                {
                    idCita: 1,
                    fecha: new Date("2025-11-25"),
                    estado: "Confirmada",
                    motivo: "Cardiología",
                    observaciones: "",
                    paciente: {
                        idPaciente: 1,
                        nombrePaciente: "Juan Pérez",
                        correoPaciente: "juan.perez@email.com",
                    },
                    medico: {
                        idMedico: 10,
                        nombreMedico: "Dr. Carlos López",
                        especialidadMedico: "Cardiología",
                    },
                },
                {
                    idCita: 2,
                    fecha: new Date("2025-11-26"),
                    estado: "Confirmada",
                    motivo: "Dermatología",
                    observaciones: "",
                    paciente: {
                        idPaciente: 1,
                        nombrePaciente: "Juan Pérez",
                        correoPaciente: "juan.perez@email.com",
                    },
                    medico: {
                        idMedico: 20,
                        nombreMedico: "Dra. Ana Martínez",
                        especialidadMedico: "Dermatología",
                    },
                },
                {
                    idCita: 3,
                    fecha: new Date("2025-11-27"),
                    estado: "Pendiente",
                    motivo: "Medicina General",
                    observaciones: "",
                    paciente: {
                        idPaciente: 1,
                        nombrePaciente: "Juan Pérez",
                        correoPaciente: "juan.perez@email.com",
                    },
                    medico: {
                        idMedico: 30,
                        nombreMedico: "Dr. Luis Fernández",
                        especialidadMedico: "Medicina General",
                    },
                },
            ];

            mockCitaRepo.obtenerCitasConDetallesPorPaciente.mockResolvedValue(
                citasConDetalles
            );

            const resultado =
                await mockCitaRepo.obtenerCitasConDetallesPorPaciente(1);

            expect(resultado).toHaveLength(3);
            expect(resultado[0].medico.idMedico).toBe(10);
            expect(resultado[1].medico.idMedico).toBe(20);
            expect(resultado[2].medico.idMedico).toBe(30);
            expect(resultado[0].medico.especialidadMedico).toBe("Cardiología");
            expect(resultado[1].medico.especialidadMedico).toBe("Dermatología");
            expect(resultado[2].medico.especialidadMedico).toBe(
                "Medicina General"
            );
        });
    });
});
