const express = require("express");
const router = express.Router();
const DB = require("../db");

/**
 * Middleware para verificar que existe el empleado con parámetro id
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @returns
 */
async function checkEmp(req, res, next) {
  const emp = await DB.Employees.getById(req.params.id);
  if (!emp) {
    return res.status(404).send("Empleado no encontrado!!!");
  }
  // se guarda el objeto encontrado en la propiedad locals
  // para que pueda ser usado en los siguientes eslabones de la cadena
  res.locals.emp = emp;
  next();
}

// GET /api/v1/empleados
router.get("/", async (req, res) => {
  const emps = await DB.Employees.getAll();
  res.status(200).json(emps);
});

// GET /api/v1/empleados/:id
router.get("/:id", checkEmp, (req, res) => {
  res.status(200).json(res.locals.emp);
});

// GET /api/v1/empleados/:id/salaries
router.get("/:id/salaries", checkEmp, async (req, res) => {
  const salaries = await DB.Employees.getSalary(res.locals.emp);
  res.status(200).json(salaries);
});

// POST /api/v1/empleados
router.post("/", async (req, res) => {
  const { emp_no, birth_date, first_name, last_name, gender, hire_date } =
    req.body;
  if (!emp_no) {
    res.status(400).send("emp_no es Requerido!!!");
    return;
  }
  if (!birth_date) {
    res.status(400).send("birth_date es Requerido!!!");
    return;
  }
  if (!first_name) {
    res.status(400).send("first_name es Requerido!!!");
    return;
  }
  if (!last_name) {
    res.status(400).send("last_name es Requerido!!!");
    return;
  }
  if (!gender) {
    res.status(400).send("gender es Requerido!!!");
    return;
  }
  if (!hire_date) {
    res.status(400).send("hire_date es Requerido!!!");
    return;
  }
  const emp = await DB.Employees.getById(emp_no);
  if (emp) {
    res.status(500).send("ya existe el Empleado!!!");
    return;
  }
  const newEmp = {
    emp_no,
    birth_date,
    first_name,
    last_name,
    gender,
    hire_date,
  };
  const isAddOk = await DB.Employees.add(newEmp);
  if (isAddOk) {
    res.status(201).json(newEmp);
  } else {
    res.status(500).send("Falló al agregar el empleado!!!");
  }
});

// PUT /api/v1/empleados/:id
router.put("/:id", checkEmp, async (req, res) => {
  const { birth_date, first_name, last_name, gender, hire_date } = req.body;
  if (!birth_date) {
    res.status(400).send("birth_date es Requerido!!!");
    return;
  }
  if (!first_name) {
    res.status(400).send("first_name es Requerido!!!");
    return;
  }
  if (!last_name) {
    res.status(400).send("last_name es Requerido!!!");
    return;
  }
  if (!gender) {
    res.status(400).send("gender es Requerido!!!");
    return;
  }
  if (!hire_date) {
    res.status(400).send("hire_date es Requerido!!!");
    return;
  }

  const { emp } = res.locals;
  emp.birth_date = birth_date;
  emp.first_name = first_name;
  emp.last_name = last_name;
  emp.gender = gender;
  emp.hire_date = hire_date;
  const isUpdateOk = await DB.Employees.update(emp);
  if (isUpdateOk) {
    res.status(200).json(emp);
  } else {
    res.status(500).send("Falló al modificar el empleado!!!");
  }
});

// DELETE /api/v1/empleados/:id
router.delete("/:id", checkEmp, async (req, res) => {
  const { emp } = res.locals;
  const isDeleteOk = await DB.Employees.delete(emp);
  if (isDeleteOk) {
    res.status(204).send();
  } else {
    res.status(500).send("Falló al eliminar el empleado!!!");
  }
});

// PUT /api/v1/empleados/changesalary/:id
router.put("/changesalary/:id", checkEmp, async (req, res) => {
  const { emp } = res.locals;
  const { salary } = req.body;
  const s = await DB.Employees.updateSalary(emp.emp_no, salary);
  res.status(200).json(s);
});

// GET /api/v1/empleados/changedepartment/:id
router.get("/changedepartment/:id", checkEmp, async (req, res) => {
  const { emp } = res.locals;
  const { dept_no } = req.body;
  const s = await DB.Employees.updateDepartment(emp.emp_no, dept_no);
  res.status(200).json(s);
});

module.exports = router;
