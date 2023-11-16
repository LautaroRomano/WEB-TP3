require("dotenv").config();
const app = require("../src/app");
const request = require("supertest");

describe("Rest API Empleados", () => {
  /* TIMEOUT ERR 
  it("GET /api/v1/empleados", async () => {
    const response = await request(app).get("/api/v1/empleados");
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    const deptos = response.body;
    expect(deptos.length).toBeGreaterThan(0);
  }); */

  it("GET /api/v1/empleados/10001", async () => {
    const response = await request(app).get("/api/v1/empleados/10001");
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    const emp = response.body;
    expect(emp).toBeDefined();
    expect(emp.emp_no).toBeDefined();
    expect(emp.emp_no).toBe(10001);
    expect(emp.birth_date).toBeDefined();
    expect(emp.birth_date).toBe("1953-09-02T03:00:00.000Z");
    expect(emp.first_name).toBeDefined();
    expect(emp.first_name).toBe("Georgi");
    expect(emp.last_name).toBeDefined();
    expect(emp.last_name).toBe("Facello");
    expect(emp.gender).toBeDefined();
    expect(emp.gender).toBe("M");
    expect(emp.hire_date).toBeDefined();
    expect(emp.hire_date).toBe("1986-06-26T03:00:00.000Z");
  });

  it("GET /api/v1/empleados/10001/salaries", async () => {
    const response = await request(app).get("/api/v1/empleados/10001/salaries");
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    const salaries = response.body;
    expect(salaries).toBeDefined();
    expect(Array.isArray(salaries)).toBe(true); // Verificar que salary es un array
    expect(salaries.length).toBeGreaterThan(1);  // Verificar que el array tiene más de un elemento
    //Comprobar que cada uno de los elementos del arreglo pertenece al empleado.
    for (salary of salaries) {
      expect(salary.emp_no).toBeDefined();
      expect(salary.emp_no).toBe(10001);
    }
  });

  it("PUT /api/v1/empleados/changesalary/10001 Comprobar API de modificación de salario", async () => {
    const beforeSalaries = (await request(app).get("/api/v1/empleados/10001/salaries")).body;
    const beforeLastSalary = beforeSalaries.find(sal => sal.to_date.includes('9999-01-01'))
    const response = await request(app)
      .put("/api/v1/empleados/changesalary/10001")
      .send({
        salary: 50000,
      });

    //Comprobar que los códigos de estado del protocolo http sean correctos
    expect(response.statusCode).toBe(200);
    // Verificar que los datos ingresados sean correctos
    expect(response.body).toEqual({});

    const afterSalaries = (await request(app).get("/api/v1/empleados/10001/salaries")).body;
    const afterLastSalary = afterSalaries.find(sal => sal.to_date.includes('9999-01-01'))

    //Comprobar que después de ejecutar la api existe un nuevo registro para ese empleado
    expect(afterSalaries.length - beforeSalaries.length).toBe(1)

    //Comprobar que después de ejecutar la api el registro de ese empleado con el campo to_date con la fecha ‘9999-01-01’ cambió a la fecha de hoy.
    const newBeforeLastSalary = afterSalaries.find(f => f.from_date == beforeLastSalary.from_date)
    expect(esHoy(newBeforeLastSalary.to_date)).toBe(true)

    //Comprobar que después de ejecutar la api el nuevo registro de ese empleado con el campo from_date con la fecha de hoy y el campo to_date con el valor ‘9999-01-01’.
    expect(esHoy(afterLastSalary.from_date)).toBe(true)
  });

  /* FALTA HACER ESTO!! 
  it("PUT /api/v1/empleados/changedepartment/10001 Comprobar API de modificación de departamento", async () => {
    const beforeDepartment = (await request(app).get("/api/v1/empleados/10001/salaries")).body;
    const beforeLastSalary = beforeDepartment.find(sal => sal.to_date.includes('9999-01-01'))
    const response = await request(app)
      .put("/api/v1/empleados/changedepartment/10001")
      .send({
        dept_no: "d009",
      });

    //Comprobar que los códigos de estado del protocolo http sean correctos
    expect(response.statusCode).toBe(200);
    // Verificar que los datos ingresados sean correctos
    expect(response.body).toEqual({});

    const afterSalaries = (await request(app).get("/api/v1/empleados/10001/salaries")).body;
    const afterLastSalary = afterSalaries.find(sal => sal.to_date.includes('9999-01-01'))

    //Comprobar que después de ejecutar la api existe un nuevo registro para ese empleado
    expect(afterSalaries.length - beforeSalaries.length).toBe(1)

    //Comprobar que después de ejecutar la api el registro de ese empleado con el campo to_date con la fecha ‘9999-01-01’ cambió a la fecha de hoy.
    const newBeforeLastSalary = afterSalaries.find(f => f.from_date == beforeLastSalary.from_date)
    expect(esHoy(newBeforeLastSalary.to_date)).toBe(true)

    //Comprobar que después de ejecutar la api el nuevo registro de ese empleado con el campo from_date con la fecha de hoy y el campo to_date con el valor ‘9999-01-01’.
    expect(esHoy(afterLastSalary.from_date)).toBe(true)
  }); */

  it("GET /api/v1/empleados/1", async () => {
    const response = await request(app).get("/api/v1/empleados/1");
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe("Empleado no encontrado!!!");
  });

  it("POST /api/v1/empleados  sin parámetros", async () => {
    const response = await request(app).post("/api/v1/empleados").send();
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("emp_no es Requerido!!!");
  });

  it("POST /api/v1/empleados  sólo con emp_no", async () => {
    const emp = { emp_no: "1" };
    const response = await request(app)
      .post("/api/v1/empleados")
      .send(emp);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("birth_date es Requerido!!!");
  });

  it("POST /api/v1/empleados  sólo con first_name", async () => {
    const emp = { first_name: "Lautaro" };
    const response = await request(app)
      .post("/api/v1/empleados")
      .send(emp);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("emp_no es Requerido!!!");
  });

  it("POST /api/v1/empleados  empleado repetido!!!", async () => {
    const emp = { emp_no: 10001, birth_date: "25-04-2002", first_name: 'Lautaro', last_name: 'Romano', gender: 'M', hire_date: "12-11-2023" };
    const response = await request(app)
      .post("/api/v1/empleados")
      .send(emp);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(500);
    expect(response.text).toBe("ya existe el Empleado!!!");
  });

  it("Verificar que agrega con POST /api/v1/empleados", async () => {
    const emp = { emp_no: 1, birth_date: "11-04-2002", first_name: 'Lautaro', last_name: 'Romano', gender: 'M', hire_date: "12-11-2023" };
    const response = await request(app)
      .post("/api/v1/empleados")
      .send(emp);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(201);
    expect(response.body).toStrictEqual(emp);

    //verificar que un objeto obtenido de la api conicide con el agregado
    const responseGET = await request(app).get("/api/v1/empleados/1");
    expect(responseGET).toBeDefined();
    expect(responseGET.statusCode).toBe(200);
    expect(responseGET.body).toBeDefined();
    expect(responseGET.body.emp_no).toBe(1);
    expect(responseGET.body.first_name).toBe("Lautaro");
    expect(responseGET.body.last_name).toBe("Romano");
    expect(responseGET.body.gender).toBe("M");

    // luego eliminar
    const responseDelete = await request(app)
      .delete("/api/v1/empleados/1")
      .send();
    expect(responseDelete).toBeDefined();
    expect(responseDelete.statusCode).toBe(204);
  });

  it("Verificar que modifica con PUT /api/v1/empleados", async () => {
    const emp = { emp_no: 1, birth_date: "11-04-2002", first_name: 'Lautaro', last_name: 'Romano', gender: 'M', hire_date: "12-11-2023" };
    //Primero Agregamos
    const response = await request(app)
      .post("/api/v1/empleados")
      .send(emp);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(201);
    expect(response.body).toStrictEqual(emp);

    //Ahora modificamos con PUT
    const empCopia = { ...emp }; //clonamos el objeto
    empCopia.emp_no = "este código no lo tiene en cuenta";
    empCopia.atributoAdicional =
      "a este atributo adicional tampoco lo tiene en cuenta";
    empCopia.first_name = "Lisa"; //modifica el nombre del empleado
    empCopia.last_name = "Simpson"; //modifica el apellido del empleado
    empCopia.gender = "F"; //modifica el genero del empleado
    const responseUpdate = await request(app)
      .put("/api/v1/empleados/1") // en la url debe ir la clave
      .send(empCopia); //enviamos la copia
    expect(responseUpdate).toBeDefined();
    expect(responseUpdate.statusCode).toBe(200);
    const empCopiaVerificar = { ...emp }; //clonamos el objeto
    empCopiaVerificar.first_name = "Lisa";
    empCopiaVerificar.last_name = "Simpson";
    empCopiaVerificar.gender = "F";
    empCopiaVerificar.birth_date = "11-04-2002";
    empCopiaVerificar.hire_date = "12-11-2023";
    expect(responseUpdate.body).toStrictEqual(empCopiaVerificar); //verificamos con la copia para verificar

    //verificar que un objeto obtenido de la api conicide con el agregado y luego modificado
    const responseGET = await request(app).get("/api/v1/empleados/1");
    expect(responseGET).toBeDefined();
    expect(responseGET.statusCode).toBe(200);
    empCopiaVerificar.birth_date = "2002-11-04T03:00:00.000Z";
    empCopiaVerificar.hire_date = "2023-12-11T03:00:00.000Z";
    expect(responseGET.body).toStrictEqual(empCopiaVerificar); //verificamos con la copia para verificar

    // luego eliminar
    const responseDelete = await request(app)
      .delete("/api/v1/empleados/1")
      .send();
    expect(responseDelete).toBeDefined();
    expect(responseDelete.statusCode).toBe(204);
  });
});

function esHoy(fechaString) {
  const fechaProporcionada = new Date(fechaString);
  const fechaActual = new Date();

  const fechaProporcionadaFormateada = fechaProporcionada.toISOString().split('T')[0];
  const fechaActualFormateada = fechaActual.toISOString().split('T')[0];

  return fechaProporcionadaFormateada === fechaActualFormateada;
}