import { Medico } from "../../src/core/dominio/medico/Medico";

describe("Medico - Validaciones", () => {
    describe("validarCorreo", () => {
        it("debería aceptar correo válido", () => {
            expect(Medico.validarCorreo("doctor@example.com")).toBe(true);
        });

        it("debería aceptar correo con subdominio", () => {
            expect(Medico.validarCorreo("medico@correo.hospital.com")).toBe(true);
        });

        it("debería rechazar correo sin @", () => {
            expect(Medico.validarCorreo("doctorexample.com")).toBe(false);
        });

        it("debería rechazar correo sin dominio", () => {
            expect(Medico.validarCorreo("doctor@")).toBe(false);
        });

        it("debería rechazar correo sin extensión", () => {
            expect(Medico.validarCorreo("doctor@example")).toBe(false);
        });

        it("debería rechazar correo con espacios", () => {
            expect(Medico.validarCorreo("doctor ortiz@example.com")).toBe(false);
        });
    });

    describe("Factory Methods", () => {
        describe("crear", () => {
            it("debería crear un médico sin ID", () => {
                const medico = Medico.crear(
                    "Juan Pérez",
                    "juan@example.com",
                    "Cardiología"
                );

                expect(medico.idMedico).toBeNull();
                expect(medico.nombreMedico).toBe("Juan Pérez");
                expect(medico.correoMedico).toBe("juan@example.com");
                expect(medico.especialidadMedico).toBe("Cardiología");
            });
        });

        describe("desdeBD", () => {
            it("debería crear médico con ID desde BD", () => {
                const medico = Medico.desdeBD(
                    10,
                    "Ana Gómez",
                    "ana@example.com",
                    "Dermatología"
                );

                expect(medico.idMedico).toBe(10);
                expect(medico.nombreMedico).toBe("Ana Gómez");
                expect(medico.correoMedico).toBe("ana@example.com");
                expect(medico.especialidadMedico).toBe("Dermatología");
            });

            it("debería crear médico con ID grande", () => {
                const medico = Medico.desdeBD(
                    999,
                    "Test",
                    "test@example.com",
                    "Oncología"
                );

                expect(medico.idMedico).toBe(999);
            });
        });
    });

    describe("toObject", () => {
        it("debería convertir médico a objeto correctamente", () => {
            const medico = Medico.crear(
                "Laura Torres",
                "laura@example.com",
                "Neurología"
            );

            const obj = medico.toObject();

            expect(obj).toEqual({
                idMedico: null,
                nombreMedico: "Laura Torres",
                correoMedico: "laura@example.com",
                especialidadMedico: "Neurología",
            });
        });

        it("debería convertir médico desde BD a objeto", () => {
            const medico = Medico.desdeBD(
                5,
                "Carlos Ruiz",
                "carlos@example.com",
                "Pediatría"
            );

            const obj = medico.toObject();

            expect(obj).toEqual({
                idMedico: 5,
                nombreMedico: "Carlos Ruiz",
                correoMedico: "carlos@example.com",
                especialidadMedico: "Pediatría",
            });
        });
    });

    describe("Constructor", () => {
        it("debería crear instancia con constructor directo", () => {
            const medico = new Medico({
                idMedico: 3,
                nombreMedico: "Test",
                correoMedico: "test@example.com",
                especialidadMedico: "Ginecología"
            });

            expect(medico.idMedico).toBe(3);
            expect(medico.nombreMedico).toBe("Test");
            expect(medico.especialidadMedico).toBe("Ginecología");
        });

        it("debería asignar null cuando idMedico es null", () => {
            const medico = new Medico({
                idMedico: null,
                nombreMedico: "Test",
                correoMedico: "test@example.com",
                especialidadMedico: "Psiquiatría"
            });

            expect(medico.idMedico).toBeNull();
        });
    });
});
