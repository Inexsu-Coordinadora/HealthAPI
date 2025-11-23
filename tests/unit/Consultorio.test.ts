import { Consultorio } from "../../src/core/dominio/consultorio/Consultorio";

describe("Consultorio", () => {

    test("crear() debe crear un consultorio con valores por defecto", () => {
        const consultorio = Consultorio.crear("Consultorio A");

        expect(consultorio.idConsultorio).toBeNull();
        expect(consultorio.nombreConsultorio).toBe("Consultorio A");
        expect(consultorio.ubicacionConsultorio).toBeNull();
        expect(consultorio.capacidadConsultorio).toBeNull();
    });

    test("crear() debe asignar ubicación y capacidad cuando se pasan", () => {
        const consultorio = Consultorio.crear("Consultorio B", "2do piso", 15);

        expect(consultorio.idConsultorio).toBeNull();
        expect(consultorio.nombreConsultorio).toBe("Consultorio B");
        expect(consultorio.ubicacionConsultorio).toBe("2do piso");
        expect(consultorio.capacidadConsultorio).toBe(15);
    });

    test("desdeBD() debe construir un consultorio con id y datos completos", () => {
        const consultorio = Consultorio.desdeBD(10, "Consultorio C", "Planta baja", 20);

        expect(consultorio.idConsultorio).toBe(10);
        expect(consultorio.nombreConsultorio).toBe("Consultorio C");
        expect(consultorio.ubicacionConsultorio).toBe("Planta baja");
        expect(consultorio.capacidadConsultorio).toBe(20);
    });

    test("toObject() debe devolver un objeto plano válido", () => {
        const consultorio = Consultorio.crear("Consultorio D", "3er piso", 8);

        const obj = consultorio.toObject();

        expect(obj).toEqual({
            idConsultorio: null,
            nombreConsultorio: "Consultorio D",
            ubicacionConsultorio: "3er piso",
            capacidadConsultorio: 8,
        });
    });

});
