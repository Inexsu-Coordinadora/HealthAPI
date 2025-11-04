export interface CrearCitaDTO {
  idPaciente: number;
  idDisponibilidad: number;
  fecha: Date | string;
  estado: string;
  motivo?: string | null;
  observaciones?: string;
}

export interface ActualizarCitaDTO {
  idPaciente?: number;
  idDisponibilidad?: number;
  fecha?: Date | string;
  estado?: string;
  motivo?: string | null;
  observaciones?: string;
}

export function validarCrearCita(datos: any): { valido: boolean; errores: string[] } {
  const errores: string[] = [];


  if (datos.idPaciente === undefined || typeof datos.idPaciente !== 'number' || isNaN(datos.idPaciente)) {
    errores.push('El idPaciente es obligatorio y debe ser un número válido');
  }


  if (datos.idDisponibilidad === undefined || typeof datos.idDisponibilidad !== 'number' || isNaN(datos.idDisponibilidad)) {
    errores.push('El idDisponibilidad es obligatorio y debe ser un número válido');
  }

  if (!datos.fecha || isNaN(Date.parse(datos.fecha))) {
    errores.push('La fecha es obligatoria y debe tener un formato de fecha válido');
  }


  if (!datos.estado || typeof datos.estado !== 'string' || datos.estado.trim() === '') {
    errores.push('El estado es obligatorio y debe ser texto');
  }

  if (datos.motivo !== undefined && datos.motivo !== null) {
    if (typeof datos.motivo !== 'string') {
      errores.push('El motivo debe ser texto o nulo');
    }
  }

  if (datos.observaciones !== undefined && typeof datos.observaciones !== 'string') {
    errores.push('Las observaciones deben ser texto');
  }

  return {
    valido: errores.length === 0,
    errores,
  };
}


export function validarActualizarCita(datos: any): { valido: boolean; errores: string[] } {
  const errores: string[] = [];


  if (
    datos.idPaciente === undefined &&
    datos.idDisponibilidad === undefined &&
    datos.fecha === undefined &&
    datos.estado === undefined &&
    datos.motivo === undefined &&
    datos.observaciones === undefined
  ) {
    errores.push('Debe proporcionar al menos un campo para actualizar');
    return { valido: false, errores };
  }

  if (datos.idPaciente !== undefined) {
    if (typeof datos.idPaciente !== 'number' || isNaN(datos.idPaciente)) {
      errores.push('El idPaciente debe ser un número válido');
    }
  }

  if (datos.idDisponibilidad !== undefined) {
    if (typeof datos.idDisponibilidad !== 'number' || isNaN(datos.idDisponibilidad)) {
      errores.push('El idDisponibilidad debe ser un número válido');
    }
  }

  if (datos.fecha !== undefined && isNaN(Date.parse(datos.fecha))) {
    errores.push('La fecha debe tener un formato válido');
  }

  if (datos.estado !== undefined) {
    if (typeof datos.estado !== 'string' || datos.estado.trim() === '') {
      errores.push('El estado debe ser texto y no puede estar vacío');
    }
  }

  if (datos.motivo !== undefined && datos.motivo !== null) {
    if (typeof datos.motivo !== 'string') {
      errores.push('El motivo debe ser texto o nulo');
    }
  } 

  if (datos.observaciones !== undefined) {
    if (typeof datos.observaciones !== 'string') {
      errores.push('Las observaciones deben ser texto');
    }
  }

  return {
    valido: errores.length === 0,
    errores,
  };
}
