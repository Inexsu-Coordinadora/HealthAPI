export interface CrearPacienteDTO {
  nombrePaciente: string;
  correoPaciente: string;
  telefonoPaciente?: string | null;
}

export interface ActualizarPacienteDTO {
  nombrePaciente?: string;
  correoPaciente?: string;
  telefonoPaciente?: string | null;
}

// Validar datos para crear paciente
export function validarCrearPaciente(datos: any): { valido: boolean; errores: string[] } {
  const errores: string[] = [];

  if (!datos.nombrePaciente || typeof datos.nombrePaciente !== 'string' || datos.nombrePaciente.trim() === '') {
    errores.push('El nombre del paciente es obligatorio y debe ser texto');
  }

  if (!datos.correoPaciente || typeof datos.correoPaciente !== 'string' || datos.correoPaciente.trim() === '') {
    errores.push('El correo del paciente es obligatorio y debe ser texto');
  } else {
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(datos.correoPaciente)) {
      errores.push('El formato del correo electrónico es inválido');
    }
  }

  if (!datos.telefonoPaciente || typeof datos.telefonoPaciente !== 'string' || datos.telefonoPaciente.trim() === '') {
    errores.push('El teléfono del paciente es obligatorio y debe ser texto');
  }

  return {
    valido: errores.length === 0,
    errores,
  };
}

// Validar datos para actualizar paciente
export function validarActualizarPaciente(datos: any): { valido: boolean; errores: string[] } {
  const errores: string[] = [];

  // Al menos un campo debe estar presente
  if (!datos.nombrePaciente && !datos.correoPaciente && !datos.telefonoPaciente) {
    errores.push('Debe proporcionar al menos un campo para actualizar');
    return { valido: false, errores };
  }

  if (datos.nombrePaciente !== undefined) {
    if (typeof datos.nombrePaciente !== 'string' || datos.nombrePaciente.trim() === '') {
      errores.push('El nombre del paciente debe ser texto y no puede estar vacío');
    }
  }

  if (datos.correoPaciente !== undefined) {
    if (typeof datos.correoPaciente !== 'string' || datos.correoPaciente.trim() === '') {
      errores.push('El correo del paciente debe ser texto y no puede estar vacío');
    } else {
      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexCorreo.test(datos.correoPaciente)) {
        errores.push('El formato del correo electrónico es inválido');
      }
    }
  }

  if (datos.telefonoPaciente !== undefined) {
    if (typeof datos.telefonoPaciente !== 'string' || datos.telefonoPaciente.trim() === '') {
      errores.push('El teléfono del paciente debe ser texto y no puede estar vacío');
    }
  }

  return {
    valido: errores.length === 0,
    errores,
  };
}
