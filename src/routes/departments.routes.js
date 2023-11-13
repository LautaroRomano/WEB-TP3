const express = require("express");
const router = express.Router();
const DB = require("../db");

/**
 * Middleware para verificar que existe el departamento con parámetro id
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @returns
 */
async function checkDepto(req, res, next) {
  const depto = await DB.Departmens.getById(req.params.id);
  if (!depto) {
    return res.status(404).send("Departamento no encontrado!!!");
  }
  // se guarda el objeto encontrado en la propiedad locals
  // para que pueda ser usado en los siguientes eslabones de la cadena
  res.locals.depto = depto;
  next();
}

// GET /api/v1/departamentos
router.get("/", async (req, res) => {
  const deptos = await DB.Departmens.getAll();
  res.status(200).json(deptos);
});

// GET /api/v1/departamentos/:id
router.get("/:id", checkDepto, (req, res) => {
  res.status(200).json(res.locals.depto);
});

// GET /api/v1/departamentos/:id/manager
router.get("/:id/manager", checkDepto, async (req, res) => {
  const manager = await DB.Departmens.getActualManager(res.locals.depto);
  res.status(200).json(manager);
});

// POST /api/v1/departamentos
router.post("/", async (req, res) => {
  const { dept_no, dept_name } = req.body;
  if (!dept_no) {
    res.status(400).send("dept_no es Requerido!!!");
    return;
  }
  if (!dept_name) {
    res.status(400).send("dept_name es Requerido!!!");
    return;
  }
  const depto = await DB.Departmens.getById(dept_no);
  if (depto) {
    res.status(500).send("ya existe el Departamento!!!");
    return;
  }
  const deptoNuevo = { dept_no, dept_name };
  const isAddOk = await DB.Departmens.add(deptoNuevo);
  if (isAddOk) {
    res.status(201).json(deptoNuevo);
  } else {
    res.status(500).send("Falló al agregar el departamento!!!");
  }
});

// PUT /api/v1/departamentos/:id
router.put("/:id", checkDepto, async (req, res) => {
  const { dept_name } = req.body;
  if (!dept_name) {
    res.status(400).send("dept_name es Requerido!!!");
    return;
  }
  const { depto } = res.locals;
  depto.dept_name = dept_name;
  const isUpdateOk = await DB.Departmens.update(depto);
  if (isUpdateOk) {
    res.status(200).json(depto);
  } else {
    res.status(500).send("Falló al modificar el departamento!!!");
  }
});

// DELETE /api/v1/departamentos/:id
router.delete("/:id", checkDepto, async (req, res) => {
  const { depto } = res.locals;
  const isDeleteOk = await DB.Departmens.delete(depto);
  if (isDeleteOk) {
    res.status(204).send();
  } else {
    res.status(500).send("Falló al eliminar el departamento!!!");
  }
});

// GET /api/v1/departamentos/managers/:id
router.get("/managers/:id", checkDepto, async (req, res) => {
  const { depto } = res.locals;
  const managers = await DB.Departmens.getManagers(depto);
  res.status(200).json(managers);
});

module.exports = router;
