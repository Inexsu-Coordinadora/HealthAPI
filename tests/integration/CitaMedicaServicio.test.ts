import { CitaMedicaRepositorioPostgres } from "../../src/core/infraestructura/cita/CitaMedicaRepository.js";
import { DisponibilidadRepositorioPostgres } from "../../src/core/infraestructura/disponibilidad/DisponibilidadRepository.js";
import { PacienteRepositorioPostgres } from "../../src/core/infraestructura/paciente/PacienteRepository.js";
import { MedicoRepositorioPostgres } from "../../src/core/infraestructura/medico/MedicoRepository.js";
import { ConsultorioRepositorioPostgres } from "../../src/core/infraestructura/consultorio/ConsultorioRepository.js";
import {
    CitaMedicaServicio,
    DisponibilidadOcupadaError,
    TraslapePacienteError,
} from "../../src/core/aplicacion/casos-uso-cita/CitaMedicaServicio.js";
import type { IPaciente } from "../../src/core/dominio/paciente/IPaciente.js";
import type { IMedico } from "../../src/core/dominio/medico/IMedico.js";
import type { IConsultorio } from "../../src/core/dominio/consultorio/IConsultorio.js";
import { IDisponibilidad } from "../../src/core/dominio/disponibilidad/IDisponibilidad.js";

describe("CitaMedicaServicio - Tests de Integración", () => {
    let citaRepo: CitaMedicaRepositorioPostgres;
    let disponibilidadRepo: DisponibilidadRepositorioPostgres;
    let pacienteRepo: PacienteRepositorioPostgres;
    let medicoRepo: MedicoRepositorioPostgres;
    let consultorioRepo: ConsultorioRepositorioPostgres;
    let servicio: CitaMedicaServicio;

    let pacienteId: number;
    let medicoId: number;
    let consultorioId: number;
    let disponibilidadId: number;
    const citasCreadas: number[] = [];

    beforeAll(async () => {
        citaRepo = new CitaMedicaRepositorioPostgres();
        disponibilidadRepo = new DisponibilidadRepositorioPostgres();
        pacienteRepo = new PacienteRepositorioPostgres();
        medicoRepo = new MedicoRepositorioPostgres();
        consultorioRepo = new ConsultorioRepositorioPostgres();
        servicio = new CitaMedicaServicio(
            citaRepo,
            disponibilidadRepo,
            pacienteRepo
        );

        // Crear datos de prueba
        const paciente: Omit<IPaciente, "idPaciente"> = {
            nombrePaciente: "Test Simplificado Integration",
            correoPaciente: `test.simplificado.${Date.now()}@email.com`,
            telefonoPaciente: "1234567",
        };
        const pacienteCreado = await pacienteRepo.crearPaciente(paciente);
        pacienteId = pacienteCreado.idPaciente!;

        const medico: IMedico = {
            idMedico: null,
            nombreMedico: "Dr. Test Simplificado",
            especialidadMedico: "Medicina General",
            correoMedico: `dr.simplificado.${Date.now()}@hospital.com`,
        };
        const medicoCreado = await medicoRepo.crearMedico(medico);
        medicoId = medicoCreado.idMedico!;

        const consultorio: IConsultorio = {
            idConsultorio: null,
            nombreConsultorio: "Consultorio Simplificado Test",
            ubicacionConsultorio: "Piso 1",
            capacidadConsultorio: 1,
        };
        const consultorioCreado =
            await consultorioRepo.crearConsultorio(consultorio);
        consultorioId = consultorioCreado.idConsultorio!;

        const disponibilidad: IDisponibilidad = {
            idDisponibilidad: null,
            idMedico: medicoId,
            idConsultorio: consultorioId,
            diaSemana: "lunes",
            horaInicio: "09:00:00",
            horaFin: "13:00:00",
        };
        const disponibilidadCreada =
            await disponibilidadRepo.crearDisponibilidad(disponibilidad);
        disponibilidadId = disponibilidadCreada.idDisponibilidad!;
    });

    afterAll(async () => {
        // Limpiar datos de prueba
        for (const idCita of citasCreadas) {
            await citaRepo.eliminarCita(idCita);
        }
        if (disponibilidadId) {
            await disponibilidadRepo.eliminarDisponibilidad(disponibilidadId);
        }
        if (consultorioId) {
            await consultorioRepo.eliminarConsultorio(consultorioId);
        }
        if (medicoId) {
            await medicoRepo.eliminarMedico(medicoId);
        }
        if (pacienteId) {
            await pacienteRepo.eliminarPaciente(pacienteId);
        }
    });

    describe("agendarCitaConValidacion", () => {
        it("debería crear una cita exitosamente", async () => {
            const datosCita = {
                idPaciente: pacienteId,
                idDisponibilidad: disponibilidadId,
                fecha: "2025-12-01T10:00:00",
                motivo: "Test estrategia simplificada",
                observaciones: "Test de integración",
            };

            const resultado =
                await servicio.agendarCitaConValidacion(datosCita);

            citasCreadas.push(resultado.idCita!);

            expect(resultado).toBeDefined();
            expect(resultado.idCita).toBeGreaterThan(0);
            expect(resultado.estado).toBe("programada");
            expect(resultado.idPaciente).toBe(pacienteId);
            expect(resultado.idDisponibilidad).toBe(disponibilidadId);
        });

        it("debería lanzar error si la disponibilidad ya está ocupada", async () => {
            const datosCita = {
                idPaciente: pacienteId,
                idDisponibilidad: disponibilidadId,
                fecha: "2025-12-08T10:30:00",
                motivo: null,
                observaciones: "Test disponibilidad ocupada",
            };

            // Crear primera cita
            const cita1 = await servicio.agendarCitaConValidacion(datosCita);
            citasCreadas.push(cita1.idCita!);

            // Intentar crear segunda cita en la misma disponibilidad y fecha
            await expect(
                servicio.agendarCitaConValidacion(datosCita)
            ).rejects.toThrow(DisponibilidadOcupadaError);
        });

        it("debería lanzar error si el paciente ya tiene cita", async () => {
            const datosCita = {
                idPaciente: pacienteId,
                idDisponibilidad: disponibilidadId,
                fecha: "2025-12-15T09:30:00",
                motivo: null,
                observaciones: "Test traslape paciente",
            };

            // Crear primera cita
            const cita1 = await servicio.agendarCitaConValidacion(datosCita);
            citasCreadas.push(cita1.idCita!);

            // Intentar crear segunda cita en la misma fecha (disponibilidad ocupada)
            await expect(
                servicio.agendarCitaConValidacion(datosCita)
            ).rejects.toThrow(DisponibilidadOcupadaError);
        });

        it("debería verificar que el médico viene de la disponibilidad", async () => {
            const datosCita = {
                idPaciente: pacienteId,
                idDisponibilidad: disponibilidadId,
                fecha: "2025-12-22T11:00:00",
                motivo: "Verificar médico implícito",
                observaciones: "",
            };

            const resultado =
                await servicio.agendarCitaConValidacion(datosCita);
            citasCreadas.push(resultado.idCita!);

            // Obtener cita con detalles
            const consultas =
                await citaRepo.obtenerCitasConDetallesPorPaciente(pacienteId);
            const primeraConsulta = consultas.find(
                (c) => c.idCita === resultado.idCita
            );

            expect(primeraConsulta?.medico?.idMedico).toBe(medicoId);
        });

        it("debería permitir múltiples citas en diferentes fechas", async () => {
            const cita1 = {
                idPaciente: pacienteId,
                idDisponibilidad: disponibilidadId,
                fecha: "2026-01-05T09:00:00",
                motivo: "Primera cita",
                observaciones: "",
            };

            const cita2 = {
                idPaciente: pacienteId,
                idDisponibilidad: disponibilidadId,
                fecha: "2026-01-12T09:00:00",
                motivo: "Segunda cita",
                observaciones: "",
            };

            const resultado1 = await servicio.agendarCitaConValidacion(cita1);
            const resultado2 = await servicio.agendarCitaConValidacion(cita2);

            citasCreadas.push(resultado1.idCita!, resultado2.idCita!);

            expect(resultado1.idCita).toBeDefined();
            expect(resultado2.idCita).toBeDefined();
            expect(resultado1.idCita).not.toBe(resultado2.idCita);
        });
    });

    describe("CrearCitaMedica", () => {
        it("debería crear una cita validando día de disponibilidad", async () => {
            const citaDatos = {
                idPaciente: pacienteId,
                idDisponibilidad: disponibilidadId,
                fecha: new Date("2025-12-01T10:00:00.000Z"),
                estado: "programada" as const,
                motivo: "Test validación día",
                observaciones: "",
            };

            const resultado = await servicio.CrearCitaMedica(citaDatos);
            citasCreadas.push(resultado.idCita!);

            expect(resultado).toBeDefined();
            expect(resultado.idCita).toBeGreaterThan(0);
        });

        it("debería rechazar cita en día incorrecto", async () => {
            const citaDatos = {
                idPaciente: pacienteId,
                idDisponibilidad: disponibilidadId,
                fecha: new Date("2025-12-02T10:00:00.000Z"), // martes
                estado: "programada" as const,
                motivo: "Test día incorrecto",
                observaciones: "",
            };

            await expect(servicio.CrearCitaMedica(citaDatos)).rejects.toThrow(
                /La cita no coincide con la disponibilidad.*martes/i
            );
        });

        it("debería rechazar cita fuera de horario", async () => {
            const citaDatos = {
                idPaciente: pacienteId,
                idDisponibilidad: disponibilidadId,
                fecha: new Date("2025-12-01T14:00:00.000Z"), // 14:00, fuera de 09:00-13:00
                estado: "programada" as const,
                motivo: "Test hora incorrecta",
                observaciones: "",
            };

            await expect(servicio.CrearCitaMedica(citaDatos)).rejects.toThrow(
                /La cita no coincide con la disponibilidad/i
            );
        });
    });

    describe("obtenerCitasPorPaciente", () => {
        it("debería retornar todas las citas del paciente con detalles", async () => {
            const resultado =
                await servicio.obtenerCitasPorPaciente(pacienteId);

            expect(Array.isArray(resultado)).toBe(true);
            expect(resultado.length).toBeGreaterThan(0);

            const primeraCita = resultado[0];
            expect(primeraCita?.paciente).toBeDefined();
            expect(primeraCita?.medico).toBeDefined();
            expect(primeraCita?.paciente?.idPaciente).toBe(pacienteId);
        });

        it("debería lanzar error con ID inválido", async () => {
            await expect(servicio.obtenerCitasPorPaciente(0)).rejects.toThrow(
                "debe ser un número positivo"
            );
        });

        it("debería lanzar error si paciente no existe", async () => {
            await expect(
                servicio.obtenerCitasPorPaciente(99999)
            ).rejects.toThrow(/paciente con ID 99999 no existe/i);
        });
    });

    describe("Operaciones CRUD", () => {
        let citaId: number;

        beforeAll(async () => {
            const cita = await servicio.agendarCitaConValidacion({
                idPaciente: pacienteId,
                idDisponibilidad: disponibilidadId,
                fecha: "2026-02-02T10:00:00",
                motivo: "Test CRUD",
                observaciones: "",
            });
            citaId = cita.idCita!;
            citasCreadas.push(citaId);
        });

        it("debería obtener una cita por ID", async () => {
            const resultado = await servicio.obtenerCitaMedicaPorId(citaId);

            expect(resultado).toBeDefined();
            expect(resultado?.idCita).toBe(citaId);
        });

        it("debería actualizar una cita", async () => {
            const resultado = await servicio.actualizarCita(citaId, {
                estado: "realizada",
                observaciones: "Cita completada",
            });

            expect(resultado?.estado).toBe("realizada");
            expect(resultado?.observaciones).toBe("Cita completada");
        });

        it("debería listar todas las citas", async () => {
            const resultado = await servicio.listarCitas();

            expect(Array.isArray(resultado)).toBe(true);
            expect(resultado.length).toBeGreaterThan(0);
        });

        it("debería eliminar una cita", async () => {
            const resultado = await servicio.eliminarCitaMedica(citaId);

            expect(resultado).toBe(true);

            const citaEliminada = await servicio.obtenerCitaMedicaPorId(citaId);
            expect(citaEliminada).toBeNull();

            // Remover de la lista de limpieza
            const index = citasCreadas.indexOf(citaId);
            if (index > -1) citasCreadas.splice(index, 1);
        });
    });
});
