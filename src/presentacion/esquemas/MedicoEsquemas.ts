export interface CrearMedicoDTO {
  nombreMedico: string;
  correoMedico: string;
  especialidadMedico: string;
}

export interface ActualizarMedicoDTO {
  nombreMedico?: string;
  correoMedico?: string;
  especialidadMedico?: string;
}


export function validarCrearMedico(datos: any): { valido: boolean; errores: string[] } {
  const errores: string[] = [];

  if (!datos.nombreMedico || typeof datos.nombreMedico !== 'string' || datos.nombreMedico.trim() === '') {
    errores.push('El nombre del médico es obligatorio y debe ser texto');
  }

  if (!datos.correoMedico || typeof datos.correoMedico !== 'string' || datos.correoMedico.trim() === '') {
    errores.push('El correo del médico es obligatorio y debe ser texto');
  } else {
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(datos.correoMedico)) {
      errores.push('El formato del correo electrónico es inválido');
    }
  }

  if (!datos.especialidadMedico || typeof datos.especialidadMedico !== 'string' || datos.especialidadMedico.trim() === '') {
    errores.push('La especialidad del médico es obligatoria y debe ser texto');
  }

  return {
    valido: errores.length === 0,
    errores,
  };
}

export function validarActualizarMedico(datos: any): { valido: boolean; errores: string[] } {
  const errores: string[] = [];

  if (!datos.nombreMedico && !datos.correoMedico && !datos.especialidadMedico) {
    errores.push('Debe proporcionar al menos un campo para actualizar');
    return { valido: false, errores };
  }

  if (datos.nombreMedico !== undefined) {
    if (typeof datos.nombreMedico !== 'string' || datos.nombreMedico.trim() === '') {
      errores.push('El nombre del médico debe ser texto y no puede estar vacío');
    }
  }

  if (datos.correoMedico !== undefined) {
    if (typeof datos.correoMedico !== 'string' || datos.correoMedico.trim() === '') {
      errores.push('El correo del médico debe ser texto y no puede estar vacío');
    } else {
      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexCorreo.test(datos.correoMedico)) {
        errores.push('El formato del correo electrónico es inválido');
      }
    }
  }

  if (datos.especialidadMedico !== undefined) {
    if (typeof datos.especialidadMedico !== 'string' || datos.especialidadMedico.trim() === '') {
      errores.push('La especialidad del médico debe ser texto y no puede estar vacía');
    }
  }

  return {
    valido: errores.length === 0,
    errores,
  };
}
