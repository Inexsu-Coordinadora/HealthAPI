export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        statusCode: number = 500,
        isOperational: boolean = true
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

// Errores específicos
export class BadRequestError extends AppError {
    constructor(message: string) {
        super(message, 400);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404);
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409);
    }
}

export class UnprocessableEntityError extends AppError {
    constructor(message: string) {
        super(message, 422);
    }
}
