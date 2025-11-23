import type { ICitaMedicaRepositorio } from "../../src/core/dominio/citaMedica/repositorio/ICitaMedicaRepositorio";
import type { IPacienteRepositorio } from "../../src/core/dominio/paciente/repositorio/IPacienteRepositorio";
import type { IDisponibilidadRepositorio } from "../../src/core/dominio/disponibilidad/repositorio/IDisponibilidadRepositorio";

/**
 * Mock del repositorio de citas médicas
 */
export const crearMockCitaMedicaRepositorio = (): jest.Mocked<ICitaMedicaRepositorio> => ({
    crear: jest.fn(),
    obtenerCitaPorId: jest.fn(),
    listarCitas: jest.fn(),
    actualizarCita: jest.fn(),
    eliminarCita: jest.fn(),
    obtenerPorPaciente: jest.fn(),
    obtenerPorMedico: jest.fn(),
    obtenerPorEstado: jest.fn(),
    obtenerCitasConDetallesPorPaciente: jest.fn(),
    verificarCitasSuperpuestasPaciente: jest.fn(),
    verificarCitasSuperpuestasMedico: jest.fn(),
    verificarCitasSuperpuestasConsultorio: jest.fn(),
    verificarPacienteExiste: jest.fn(),
    verificarMedicoExiste: jest.fn(),
    verificarDisponibilidadExiste: jest.fn(),
    verificarConsultorioExiste: jest.fn(),
    verificarTraslapePaciente: jest.fn(),
    verificarTraslapeMedico: jest.fn(),
    verificarTraslapeConsultorio: jest.fn(),
});

/**
 * Mock del repositorio de pacientes
 */
export const crearMockPacienteRepositorio = (): jest.Mocked<IPacienteRepositorio> => ({
    crearPaciente: jest.fn(),
    obtenerPacientePorId: jest.fn(),
    listarPacientes: jest.fn(),
    actualizarPaciente: jest.fn(),
    eliminarPaciente: jest.fn(),
    obtenerPorCorreo: jest.fn(),
});

/**
 * Mock del repositorio de disponibilidad
 */
export const crearMockDisponibilidadRepositorio = (): jest.Mocked<IDisponibilidadRepositorio> => ({
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
});