import { Paciente } from "../../src/core/dominio/paciente/Paciente.js";
import type { IPaciente } from "../../src/core/dominio/paciente/IPaciente.js";

describe("Paciente - Unit Tests", () => {
    describe("constructor", () => {
        it("debería crear un paciente con todos los campos", () => {
            const datos: IPaciente = {
                idPaciente: 1,
                nombrePaciente: "Juan Pérez",
                correoPaciente: "juan.perez@email.com",
                telefonoPaciente: "3001234567",
            };

            const paciente = new Paciente(datos);

            expect(paciente.idPaciente).toBe(1);
            expect(paciente.nombrePaciente).toBe("Juan Pérez");
            expect(paciente.correoPaciente).toBe("juan.perez@email.com");
            expect(paciente.telefonoPaciente).toBe("3001234567");
        });

        it("debería crear un paciente con teléfono null", () => {
            const datos: IPaciente = {
                idPaciente: 1,
                nombrePaciente: "María López",
                correoPaciente: "maria.lopez@email.com",
                telefonoPaciente: null,
            };

            const paciente = new Paciente(datos);

            expect(paciente.telefonoPaciente).toBeNull();
        });

        it("debería crear un paciente sin idPaciente (null por defecto)", () => {
            const datos: IPaciente = {
                nombrePaciente: "Carlos García",
                correoPaciente: "carlos.garcia@email.com",
                telefonoPaciente: "3009876543",
            };

            const paciente = new Paciente(datos);

            expect(paciente.idPaciente).toBeNull();
        });
    });

    describe("crear (factory method)", () => {
        it("debería crear un paciente con el método estático crear", () => {
            const paciente = Paciente.crear(
                "Ana Martínez",
                "ana.martinez@email.com",
                "3112223344"
            );

            expect(paciente.idPaciente).toBeNull();
            expect(paciente.nombrePaciente).toBe("Ana Martínez");
            expect(paciente.correoPaciente).toBe("ana.martinez@email.com");
            expect(paciente.telefonoPaciente).toBe("3112223344");
        });

        it("debería crear un paciente con teléfono vacío como null", () => {
            const paciente = Paciente.crear(
                "Pedro Sánchez",
                "pedro.sanchez@email.com",
                ""
            );

            expect(paciente.telefonoPaciente).toBeNull();
        });
    });

    describe("desdeBD (factory method)", () => {
        it("debería crear un paciente desde datos de BD", () => {
            const paciente = Paciente.desdeBD(
                10,
                "Laura Gómez",
                "laura.gomez@email.com",
                "3201234567"
            );

            expect(paciente.idPaciente).toBe(10);
            expect(paciente.nombrePaciente).toBe("Laura Gómez");
            expect(paciente.correoPaciente).toBe("laura.gomez@email.com");
            expect(paciente.telefonoPaciente).toBe("3201234567");
        });
    });

    describe("validarCorreo", () => {
        it("debería aceptar correo válido simple", () => {
            expect(Paciente.validarCorreo("usuario@dominio.com")).toBe(true);
        });

        it("debería aceptar correo con subdominios", () => {
            expect(Paciente.validarCorreo("usuario@mail.dominio.com")).toBe(
                true
            );
        });

        it("debería aceptar correo con números", () => {
            expect(Paciente.validarCorreo("usuario123@dominio.com")).toBe(true);
        });

        it("debería aceptar correo con guiones y puntos", () => {
            expect(
                Paciente.validarCorreo("usuario.nombre@dominio-test.com")
            ).toBe(true);
        });

        it("debería rechazar correo sin @", () => {
            expect(Paciente.validarCorreo("usuariodominio.com")).toBe(false);
        });

        it("debería rechazar correo sin dominio", () => {
            expect(Paciente.validarCorreo("usuario@")).toBe(false);
        });

        it("debería rechazar correo sin extensión", () => {
            expect(Paciente.validarCorreo("usuario@dominio")).toBe(false);
        });

        it("debería rechazar correo con espacios", () => {
            expect(Paciente.validarCorreo("usuario @dominio.com")).toBe(false);
        });

        it("debería rechazar correo vacío", () => {
            expect(Paciente.validarCorreo("")).toBe(false);
        });

        it("debería rechazar correo con múltiples @", () => {
            expect(Paciente.validarCorreo("usuario@@dominio.com")).toBe(false);
        });
    });

    describe("validarTelefono", () => {
        it("debería aceptar teléfono de 7 dígitos (mínimo)", () => {
            expect(Paciente.validarTelefono("1234567")).toBe(true);
        });

        it("debería aceptar teléfono de 10 dígitos (celular Colombia)", () => {
            expect(Paciente.validarTelefono("3001234567")).toBe(true);
        });

        it("debería aceptar teléfono con más de 10 dígitos", () => {
            expect(Paciente.validarTelefono("57300123456789")).toBe(true);
        });

        it("debería rechazar teléfono con 6 dígitos", () => {
            expect(Paciente.validarTelefono("123456")).toBe(false);
        });

        it("debería rechazar teléfono vacío", () => {
            expect(Paciente.validarTelefono("")).toBe(false);
        });

        it("debería aceptar teléfono con letras (no valida formato, solo longitud)", () => {
            // Nota: La implementación actual solo valida longitud >= 7
            expect(Paciente.validarTelefono("abcdefg")).toBe(true);
        });
    });

    describe("toObject", () => {
        it("debería convertir paciente completo a objeto", () => {
            const paciente = Paciente.desdeBD(
                5,
                "Roberto Díaz",
                "roberto.diaz@email.com",
                "3109876543"
            );

            const objeto = paciente.toObject();

            expect(objeto).toEqual({
                idPaciente: 5,
                nombrePaciente: "Roberto Díaz",
                correoPaciente: "roberto.diaz@email.com",
                telefonoPaciente: "3109876543",
            });
        });

        it("debería convertir paciente sin ID a objeto", () => {
            const paciente = Paciente.crear(
                "Sofía Ramírez",
                "sofia.ramirez@email.com",
                "3201112233"
            );

            const objeto = paciente.toObject();

            expect(objeto).toEqual({
                idPaciente: null,
                nombrePaciente: "Sofía Ramírez",
                correoPaciente: "sofia.ramirez@email.com",
                telefonoPaciente: "3201112233",
            });
        });

        it("debería convertir paciente con teléfono null a objeto", () => {
            const paciente = new Paciente({
                idPaciente: 8,
                nombrePaciente: "Diego Torres",
                correoPaciente: "diego.torres@email.com",
                telefonoPaciente: null,
            });

            const objeto = paciente.toObject();

            expect(objeto.telefonoPaciente).toBeNull();
        });

        it("debería convertir paciente con teléfono undefined a null en objeto", () => {
            const paciente = new Paciente({
                idPaciente: 9,
                nombrePaciente: "Elena Vargas",
                correoPaciente: "elena.vargas@email.com",
                telefonoPaciente: undefined,
            });

            const objeto = paciente.toObject();

            expect(objeto.telefonoPaciente).toBeNull();
        });
    });
});
