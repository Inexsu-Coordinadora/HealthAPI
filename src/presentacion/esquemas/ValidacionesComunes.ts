import * as z from "zod";

/**
 * Validaciones comunes usadas en múltiples esquemas
 */

// ============================================
// REGEX PATTERNS
// ============================================

export const REGEX_STRING_NUMERICO = /^\d+$/;

// ============================================
// ESQUEMAS REUTILIZABLES DE ZOD
// ============================================

/**
 * Esquema para validar IDs en parámetros de URL (string que se transforma a number)
 */
export const esquemaIdParam = z
    .string()
    .regex(REGEX_STRING_NUMERICO, "El ID debe ser un número válido")
    .transform((val) => Number(val));

/**
 * Esquema para IDs positivos en body (number directo)
 */
export const esquemaIdPositivo = (nombreCampo: string) =>
    z
        .number(`El ID ${nombreCampo} es obligatorio y debe ser un número`)
        .positive(`El ID ${nombreCampo} debe ser un número positivo`);

/**
 * Esquema para IDs opcionales positivos
 */
export const esquemaIdPositivoOpcional = (nombreCampo: string) =>
    z
        .number(`El ID ${nombreCampo} debe ser un número`)
        .positive(`El ID ${nombreCampo} debe ser un número positivo`)
        .nullable()
        .optional();

// ============================================
// UTILIDADES DE VALIDACIÓN
// ============================================

/**
 * Valida que un string contenga solo dígitos
 */
export const esStringNumerico = (valor: string): boolean => {
    return REGEX_STRING_NUMERICO.test(valor);
};
