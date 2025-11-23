import { CitaMedicaServicio, PacienteNoExisteError } from "../../src/core/aplicacion/casos-uso-cita/CitaMedicaServicio";
import { crearMockCitaMedicaRepositorio, crearMockPacienteRepositorio, crearMockDisponibilidadRepositorio } from "../helpers/mockRepositorios";
import { pacienteTest, pacienteInexistente, citaConDetallesTest, citaTest2 } from "../helpers/datosTest";

describe("CitaMedicaServicio - Servicio 2: Consulta de citas de un paciente", () => {
    let servicio: CitaMedicaServicio;
    let mockCitaRepo: ReturnType<typeof crearMockCitaMedicaRepositorio>;
    let mockPacienteRepo: ReturnType<typeof crearMockPacienteRepositorio>;
    let mockDisponibilidadRepo: ReturnType<typeof crearMockDisponibilidadRepositorio>;

    beforeEach(() => {
        // Reiniciar mocks antes de cada prueba
        mockCitaRepo = crearMockCitaMedicaRepositorio();
        mockPacienteRepo = crearMockPacienteRepositorio();
        mockDisponibilidadRepo = crearMockDisponibilidadRepositorio();

        servicio = new CitaMedicaServicio(
            mockCitaRepo,
            mockDisponibilidadRepo,
            mockPacienteRepo
        );
    });

    describe("obtenerCitasPorPaciente", () => {
              
        // CASOS DE ERROR

        describe("Validación de ID", () => {
            test("debe lanzar error si el ID es negativo", async () => {
                await expect(servicio.obtenerCitasPorPaciente(-1))
                    .rejects
                    .toThrow("El ID del paciente debe ser un número positivo");
            });

            test("debe lanzar error si el ID es cero", async () => {
                await expect(servicio.obtenerCitasPorPaciente(0))
                    .rejects
                    .toThrow("El ID del paciente debe ser un número positivo");
            });

            test("debe lanzar error si el ID es un número decimal negativo", async () => {
                await expect(servicio.obtenerCitasPorPaciente(-5.5))
                    .rejects
                    .toThrow("El ID del paciente debe ser un número positivo");
            });
        });

        describe("Existencia del paciente", () => {
            test("debe lanzar PacienteNoExisteError si el paciente no existe", async () => {
                // Arrange
                mockPacienteRepo.obtenerPacientePorId.mockResolvedValue(null);

                // Act & Assert
                await expect(servicio.obtenerCitasPorPaciente(pacienteInexistente.idPaciente))
                    .rejects
                    .toThrow(PacienteNoExisteError);

                // Verificar que se llamó al repositorio con el ID correcto
                expect(mockPacienteRepo.obtenerPacientePorId).toHaveBeenCalledWith(999);
                expect(mockPacienteRepo.obtenerPacientePorId).toHaveBeenCalledTimes(1);
            });

            test("debe incluir el ID del paciente en el mensaje de error", async () => {
                // Arrange
                mockPacienteRepo.obtenerPacientePorId.mockResolvedValue(null);

                // Act & Assert
                await expect(servicio.obtenerCitasPorPaciente(999))
                    .rejects
                    .toThrow("El paciente con ID 999 no existe");
            });
        });

        // ============================================
        // CASOS EXITOSOS
        // ============================================

        describe("Paciente sin citas", () => {
            test("debe retornar array vacío si el paciente no tiene citas", async () => {
                // Arrange
                mockPacienteRepo.obtenerPacientePorId.mockResolvedValue(pacienteTest);
                mockCitaRepo.obtenerCitasConDetallesPorPaciente.mockResolvedValue([]);

                // Act
                const resultado = await servicio.obtenerCitasPorPaciente(1);

                // Assert
                expect(resultado).toEqual([]);
                expect(Array.isArray(resultado)).toBe(true);
                expect(resultado.length).toBe(0);
                
                // Verificar llamadas a repositorios
                expect(mockPacienteRepo.obtenerPacientePorId).toHaveBeenCalledWith(1);
                expect(mockCitaRepo.obtenerCitasConDetallesPorPaciente).toHaveBeenCalledWith(1);
            });

            test("debe verificar la existencia del paciente antes de buscar citas", async () => {
                
                const ordenLlamadas: string[] = [];
                
                mockPacienteRepo.obtenerPacientePorId.mockImplementation(async (id) => {
                    ordenLlamadas.push("obtenerPacientePorId");
                    return pacienteTest;
                });
                
                mockCitaRepo.obtenerCitasConDetallesPorPaciente.mockImplementation(async (id) => {
                    ordenLlamadas.push("obtenerCitasConDetallesPorPaciente");
                    return [];
                });

                // Act
                await servicio.obtenerCitasPorPaciente(1);

                // Assert - Verificar orden de llamadas
                expect(ordenLlamadas).toEqual([
                    "obtenerPacientePorId",
                    "obtenerCitasConDetallesPorPaciente"
                ]);
});

        describe("Paciente con una cita", () => {
            test("debe retornar array con una cita si el paciente tiene una cita", async () => {
                // Arrange
                mockPacienteRepo.obtenerPacientePorId.mockResolvedValue(pacienteTest);
                mockCitaRepo.obtenerCitasConDetallesPorPaciente.mockResolvedValue([citaConDetallesTest]);

                // Act
                const resultado = await servicio.obtenerCitasPorPaciente(1);

                // Assert
                expect(resultado).toHaveLength(1);
                expect(resultado[0]).toEqual(citaConDetallesTest);
                expect(resultado[0].idCita).toBe(1);
                expect(resultado[0].paciente.idPaciente).toBe(1);
            });

            test("debe retornar cita con todos los detalles completos", async () => {
                // Arrange
                mockPacienteRepo.obtenerPacientePorId.mockResolvedValue(pacienteTest);
                mockCitaRepo.obtenerCitasConDetallesPorPaciente.mockResolvedValue([citaConDetallesTest]);

                // Act
                const resultado = await servicio.obtenerCitasPorPaciente(1);

                // Assert - Verificar estructura completa
                expect(resultado[0]).toHaveProperty("idCita");
                expect(resultado[0]).toHaveProperty("fecha");
                expect(resultado[0]).toHaveProperty("estado");
                expect(resultado[0]).toHaveProperty("motivo");
                expect(resultado[0]).toHaveProperty("observaciones");
                expect(resultado[0]).toHaveProperty("paciente");
                expect(resultado[0]).toHaveProperty("medico");
                expect(resultado[0]).toHaveProperty("disponibilidad");

                // Verificar datos del paciente
                expect(resultado[0].paciente).toHaveProperty("idPaciente");
                expect(resultado[0].paciente).toHaveProperty("nombrePaciente");
                expect(resultado[0].paciente).toHaveProperty("correoPaciente");

                // Verificar datos del médico
                expect(resultado[0].medico).toHaveProperty("idMedico");
                expect(resultado[0].medico).toHaveProperty("nombreMedico");
                expect(resultado[0].medico).toHaveProperty("especialidadMedico");

                // Verificar datos de disponibilidad
                expect(resultado[0].disponibilidad).toHaveProperty("diaSemana");
                expect(resultado[0].disponibilidad).toHaveProperty("horaInicio");
                expect(resultado[0].disponibilidad).toHaveProperty("horaFin");
            });
        });

        describe("Paciente con múltiples citas", () => {
            test("debe retornar array con múltiples citas si el paciente tiene varias", async () => {
                // Arrange
                const citasMock = [citaConDetallesTest, citaTest2];
                mockPacienteRepo.obtenerPacientePorId.mockResolvedValue(pacienteTest);
                mockCitaRepo.obtenerCitasConDetallesPorPaciente.mockResolvedValue(citasMock);

                // Act
                const resultado = await servicio.obtenerCitasPorPaciente(1);

                // Assert
                expect(resultado).toHaveLength(2);
                expect(resultado[0].idCita).toBe(1);
                expect(resultado[1].idCita).toBe(2);
            });

            test("debe retornar todas las citas del mismo paciente", async () => {
                // Arrange
                const citasMock = [citaConDetallesTest, citaTest2];
                mockPacienteRepo.obtenerPacientePorId.mockResolvedValue(pacienteTest);
                mockCitaRepo.obtenerCitasConDetallesPorPaciente.mockResolvedValue(citasMock);

                // Act
                const resultado = await servicio.obtenerCitasPorPaciente(1);

                // Assert - Verificar que todas pertenecen al mismo paciente
                resultado.forEach((cita) => {
                    expect(cita.paciente.idPaciente).toBe(1);
                    expect(cita.paciente.nombrePaciente).toBe("Juan Pérez Test");
                });
            });

            test("debe preservar el orden de las citas retornadas por el repositorio", async () => {
                // Arrange
                const citasMock = [citaConDetallesTest, citaTest2];
                mockPacienteRepo.obtenerPacientePorId.mockResolvedValue(pacienteTest);
                mockCitaRepo.obtenerCitasConDetallesPorPaciente.mockResolvedValue(citasMock);

                // Act
                const resultado = await servicio.obtenerCitasPorPaciente(1);

                // Assert
                expect(resultado[0].idCita).toBe(citasMock[0].idCita);
                expect(resultado[1].idCita).toBe(citasMock[1].idCita);
            });
        });

        // ============================================
        // CASOS DE INTEGRACIÓN
        // ============================================

        describe("Integración con repositorios", () => {
            test("debe llamar al repositorio de pacientes con el ID correcto", async () => {
                // Arrange
                mockPacienteRepo.obtenerPacientePorId.mockResolvedValue(pacienteTest);
                mockCitaRepo.obtenerCitasConDetallesPorPaciente.mockResolvedValue([]);

                // Act
                await servicio.obtenerCitasPorPaciente(1);

                // Assert
                expect(mockPacienteRepo.obtenerPacientePorId).toHaveBeenCalledWith(1);
                expect(mockPacienteRepo.obtenerPacientePorId).toHaveBeenCalledTimes(1);
            });

            test("debe llamar al repositorio de citas con el ID correcto", async () => {
                // Arrange
                mockPacienteRepo.obtenerPacientePorId.mockResolvedValue(pacienteTest);
                mockCitaRepo.obtenerCitasConDetallesPorPaciente.mockResolvedValue([citaConDetallesTest]);

                // Act
                await servicio.obtenerCitasPorPaciente(1);

                // Assert
                expect(mockCitaRepo.obtenerCitasConDetallesPorPaciente).toHaveBeenCalledWith(1);
                expect(mockCitaRepo.obtenerCitasConDetallesPorPaciente).toHaveBeenCalledTimes(1);
            });

            test("no debe llamar al repositorio de citas si el paciente no existe", async () => {
                // Arrange
                mockPacienteRepo.obtenerPacientePorId.mockResolvedValue(null);

                // Act & Assert
                await expect(servicio.obtenerCitasPorPaciente(999))
                    .rejects
                    .toThrow(PacienteNoExisteError);

                // Verificar que NO se llamó al repositorio de citas
                expect(mockCitaRepo.obtenerCitasConDetallesPorPaciente).not.toHaveBeenCalled();
            });
        });

        // ============================================
        // CASOS EDGE
        // ============================================

        describe("Casos edge", () => {
            test("debe manejar ID de paciente muy grande", async () => {
                // Arrange
                const idGrande = 999999999;
                mockPacienteRepo.obtenerPacientePorId.mockResolvedValue({ ...pacienteTest, idPaciente: idGrande });
                mockCitaRepo.obtenerCitasConDetallesPorPaciente.mockResolvedValue([]);

                // Act
                const resultado = await servicio.obtenerCitasPorPaciente(idGrande);

                // Assert
                expect(resultado).toEqual([]);
                expect(mockPacienteRepo.obtenerPacientePorId).toHaveBeenCalledWith(idGrande);
            });

            test("debe retornar citas con fechas en formato Date", async () => {
                // Arrange
                mockPacienteRepo.obtenerPacientePorId.mockResolvedValue(pacienteTest);
                mockCitaRepo.obtenerCitasConDetallesPorPaciente.mockResolvedValue([citaConDetallesTest]);

                // Act
                const resultado = await servicio.obtenerCitasPorPaciente(1);

                // Assert
                expect(resultado[0].fecha).toBeInstanceOf(Date);
                expect(resultado[0].fecha.getFullYear()).toBe(2025);
            });
        });
    });
});
});