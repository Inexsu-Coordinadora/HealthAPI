import { Paciente } from "../../src/core/dominio/paciente/Paciente.js";

describe("Paciente - Validaciones", () => {
    describe("validarCorreo", () => {
        it("debería aceptar correo válido", () => {
            expect(Paciente.validarCorreo("juan@example.com")).toBe(true);
        });

        it("debería aceptar correo con subdominio", () => {
            expect(Paciente.validarCorreo("usuario@mail.example.com")).toBe(
                true
            );
        });

        it("debería rechazar correo sin @", () => {
            expect(Paciente.validarCorreo("juanexample.com")).toBe(false);
        });

        it("debería rechazar correo sin dominio", () => {
            expect(Paciente.validarCorreo("juan@")).toBe(false);
        });

        it("debería rechazar correo sin extensión", () => {
            expect(Paciente.validarCorreo("juan@example")).toBe(false);
        });

        it("debería rechazar correo con espacios", () => {
            expect(Paciente.validarCorreo("juan perez@example.com")).toBe(
                false
            );
        });
    });

    describe("validarTelefono", () => {
        it("debería aceptar teléfono de 7 dígitos", () => {
            expect(Paciente.validarTelefono("1234567")).toBe(true);
        });

        it("debería aceptar teléfono de 10 dígitos", () => {
            expect(Paciente.validarTelefono("3001234567")).toBe(true);
        });

        it("debería aceptar teléfono largo", () => {
            expect(Paciente.validarTelefono("3001234567890")).toBe(true);
        });

        it("debería rechazar teléfono de 6 dígitos", () => {
            expect(Paciente.validarTelefono("123456")).toBe(false);
        });

        it("debería rechazar teléfono de 3 dígitos", () => {
            expect(Paciente.validarTelefono("123")).toBe(false);
        });

        it("debería rechazar teléfono vacío", () => {
            expect(Paciente.validarTelefono("")).toBe(false);
        });
    });

    describe("Factory methods", () => {
        describe("crear", () => {
            it("debería crear paciente sin ID", () => {
                const paciente = Paciente.crear(
                    "Juan Pérez",
                    "juan@example.com",
                    "3001234567"
                );

                expect(paciente.idPaciente).toBeNull();
                expect(paciente.nombrePaciente).toBe("Juan Pérez");
                expect(paciente.correoPaciente).toBe("juan@example.com");
                expect(paciente.telefonoPaciente).toBe("3001234567");
            });

            it("debería crear paciente con teléfono vacío", () => {
                const paciente = Paciente.crear(
                    "María López",
                    "maria@example.com",
                    ""
                );

                expect(paciente.telefonoPaciente).toBeNull();
            });

            it("debería crear paciente con todos los datos", () => {
                const paciente = Paciente.crear(
                    "Carlos García",
                    "carlos@example.com",
                    "3109876543"
                );

                expect(paciente.nombrePaciente).toBe("Carlos García");
                expect(paciente.correoPaciente).toBe("carlos@example.com");
                expect(paciente.telefonoPaciente).toBe("3109876543");
            });
        });

        describe("desdeBD", () => {
            it("debería crear paciente con ID desde BD", () => {
                const paciente = Paciente.desdeBD(
                    1,
                    "Juan Pérez",
                    "juan@example.com",
                    "3001234567"
                );

                expect(paciente.idPaciente).toBe(1);
                expect(paciente.nombrePaciente).toBe("Juan Pérez");
                expect(paciente.correoPaciente).toBe("juan@example.com");
                expect(paciente.telefonoPaciente).toBe("3001234567");
            });

            it("debería crear paciente con ID grande", () => {
                const paciente = Paciente.desdeBD(
                    999,
                    "Test User",
                    "test@example.com",
                    "1234567"
                );

                expect(paciente.idPaciente).toBe(999);
            });

            it("debería crear paciente desde BD con teléfono vacío", () => {
                const paciente = Paciente.desdeBD(
                    5,
                    "Usuario Sin Teléfono",
                    "usuario@example.com",
                    ""
                );

                expect(paciente.telefonoPaciente).toBeNull();
            });
        });
    });

    describe("toObject", () => {
        it("debería convertir paciente nuevo a objeto", () => {
            const paciente = Paciente.crear(
                "Juan Pérez",
                "juan@example.com",
                "3001234567"
            );

            const obj = paciente.toObject();

            expect(obj).toEqual({
                idPaciente: null,
                nombrePaciente: "Juan Pérez",
                correoPaciente: "juan@example.com",
                telefonoPaciente: "3001234567",
            });
        });

        it("debería convertir paciente desde BD a objeto", () => {
            const paciente = Paciente.desdeBD(
                10,
                "María López",
                "maria@example.com",
                "3109876543"
            );

            const obj = paciente.toObject();

            expect(obj).toEqual({
                idPaciente: 10,
                nombrePaciente: "María López",
                correoPaciente: "maria@example.com",
                telefonoPaciente: "3109876543",
            });
        });

        it("debería convertir paciente sin teléfono a objeto", () => {
            const paciente = Paciente.crear(
                "Usuario",
                "usuario@example.com",
                ""
            );

            const obj = paciente.toObject();

            expect(obj.telefonoPaciente).toBeNull();
        });
    });

    describe("Constructor", () => {
        it("debería crear instancia con constructor directo", () => {
            const paciente = new Paciente({
                idPaciente: 5,
                nombrePaciente: "Test",
                correoPaciente: "test@example.com",
                telefonoPaciente: "1234567",
            });

            expect(paciente.idPaciente).toBe(5);
            expect(paciente.nombrePaciente).toBe("Test");
        });

        it("debería manejar idPaciente undefined como null", () => {
            const paciente = new Paciente({
                nombrePaciente: "Test",
                correoPaciente: "test@example.com",
                telefonoPaciente: "1234567",
            });

            expect(paciente.idPaciente).toBeNull();
        });

        it("debería manejar telefonoPaciente undefined como null", () => {
            const paciente = new Paciente({
                nombrePaciente: "Test",
                correoPaciente: "test@example.com",
            });

            expect(paciente.telefonoPaciente).toBeNull();
        });
    });
});