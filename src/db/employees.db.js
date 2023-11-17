const pool = require("./connection.db");
const TABLE = "employees";

/**
 * Retorna todos los empleados
 * @returns
 */
module.exports.getAll = async function () {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT * FROM ${TABLE} d `);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Retorna un empleado por su clave primaria
 * @returns
 */
module.exports.getById = async function (id) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT * FROM ${TABLE} d WHERE emp_no=?`, [
      id,
    ]);
    return rows[0];
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Retorna el salario de un empleado
 * @param {Object} empleado
 * @returns
 */
module.exports.getSalary = async function (empleado) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL = `
SELECT 
  e.emp_no,
  e.first_name,
  e.last_name,
  e.gender,
  e.hire_date,
  s.salary,
  s.from_date,
  s.to_date
FROM employees e
	INNER JOIN salaries s ON (e.emp_no = s.emp_no)
WHERE e.emp_no = ?
order by from_date desc
`;
    const rows = await conn.query(SQL, [empleado.emp_no]);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Agrega un empleado
 * @param {Object} empleado
 * @returns
 */
module.exports.add = async function (empleado) {
  let conn;
  try {
    conn = await pool.getConnection();
    // comienza la transacción, despues se puede hacer todas las sentencias
    // SQL DML cómo si fuera una única operación.
    await conn.beginTransaction();

    const SQL = `INSERT INTO ${TABLE} (emp_no,birth_date, first_name,last_name,gender,hire_date) VALUES(?,?,?,?,?,?)`;
    const params = [];
    params[0] = empleado.emp_no;
    params[1] = new Date(empleado.birth_date);
    params[2] = empleado.first_name;
    params[3] = empleado.last_name;
    params[4] = empleado.gender;
    params[5] = new Date(empleado.hire_date);
    const rows = await conn.query(SQL, params);
    await conn.commit(); // si todas las sentencias SQL fueron correctas entonces confirmamos los cambios.
    return rows;
  } catch (err) {
    await conn.rollback(); // si falló una sentencias SQL entonces volvemos atras los cambios.
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * eliminar un empleado
 * @param {Object} empleado
 * @returns
 */
module.exports.delete = async function (empleado) {
  let conn;
  try {
    conn = await pool.getConnection();

    // comienza la transacción, despues se puede hacer todas las sentencias
    // SQL DML cómo si fuera una única operación.
    await conn.beginTransaction();

    const rows = await conn.query(`DELETE FROM ${TABLE} WHERE emp_no=?`, [
      empleado.emp_no,
    ]);
    await conn.commit(); // si todas las sentencias SQL fueron correctas entonces confirmamos los cambios.
    return rows;
  } catch (err) {
    if (conn) await conn.rollback(); // si falló una sentencias SQL entonces volvemos atras los cambios.
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Modifica un empleado
 * @param {Object} empleado
 * @returns
 */
module.exports.update = async function (empleado) {
  let conn;
  try {
    conn = await pool.getConnection();
    // comienza la transacción, despues se puede hacer todas las sentencias
    // SQL DML cómo si fuera una única operación.
    await conn.beginTransaction();

    const SQL = `UPDATE ${TABLE}  SET birth_date=?, first_name=?, last_name=?, gender=?, hire_date=? WHERE emp_no=?`;
    const params = [];
    params[0] = new Date(empleado.birth_date);
    params[1] = empleado.first_name;
    params[2] = empleado.last_name;
    params[3] = empleado.gender;
    params[4] = new Date(empleado.hire_date);
    params[5] = empleado.emp_no;
    const rows = await conn.query(SQL, params);
    await conn.commit(); // si todas las sentencias SQL fueron correctas entonces confirmamos los cambios.
    return rows;
  } catch (err) {
    if (conn) await conn.rollback(); // si falló una de las sentencias SQL entonces volvemos atras los cambios.
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Modifica un empleado
 * @param {Object} emp_no
 * @param {Object} salary
 * @returns
 */
module.exports.updateSalary = async function (emp_no, salary) {
  let conn;
  try {
    conn = await pool.getConnection();
    // comienza la transacción, despues se puede hacer todas las sentencias
    // SQL DML cómo si fuera una única operación.
    await conn.beginTransaction();
    await conn.query(
      `UPDATE salaries SET to_date=now() WHERE to_date='9999-01-01' and emp_no=?`,
      [emp_no]
    );
    await conn.query(
      `INSERT INTO salaries(emp_no,salary,from_date,to_date) values(?,?,now(),'9999-01-01')`,
      [emp_no, salary]
    );
    await conn.commit(); // si todas las sentencias SQL fueron correctas entonces confirmamos los cambios.
    return {};
  } catch (err) {
    if (conn) await conn.rollback(); // si falló una de las sentencias SQL entonces volvemos atras los cambios.
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Modifica un empleado
 * @param {Object} emp_no
 * @param {Object} dept_no
 * @returns
 */
module.exports.updateDepartment = async function (emp_no, dept_no) {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    await conn.query(
      `UPDATE dept_emp de SET de.to_date=now() WHERE de.to_date='9999-01-01' and de.emp_no=?`,
      [emp_no, dept_no]
    );
    await conn.query(
      `INSERT INTO dept_emp(emp_no,dept_no,from_date,to_date) values(?,?,now(),'9999-01-01')`,
      [emp_no, dept_no]
    );
    await conn.commit(); // si todas las sentencias SQL fueron correctas entonces confirmamos los cambios.
    return {};
  } catch (err) {
    if (conn) await conn.rollback(); // si falló una de las sentencias SQL entonces volvemos atras los cambios.
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * sql 6
* Retorna el historial de departamentos donde trabajó
* @returns 
*/
module.exports.getHistorialDeptosById = async function (emp_no) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL = `SELECT E.emp_no, E.last_name, E.first_name,
                D.dept_no, D.dept_name, 
                DE.from_date, DE.to_date
                FROM departments AS D, employees AS E, dept_emp AS DE
                WHERE E.emp_no = DE.emp_no AND D.dept_no = DE.dept_no AND E.emp_no = ?
                ORDER BY to_date`;
    const rows = await conn.query(SQL, [emp_no]);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

module.exports.deleteSalary = async function (emp_no, from_date) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL = `delete from salaries where emp_no = ? and from_date = ?`;
    const rows = await conn.query(SQL, [emp_no, from_date]);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

module.exports.setLastSalary = async function (emp_no, from_date) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL = `update salaries set to_date='9999-01-01' where from_date = ? and emp_no = ?`;
    const rows = await conn.query(SQL, [from_date, emp_no]);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

module.exports.deleteEmpDep = async function (emp_no, to_date) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL = `delete from dept_emp where emp_no = ? and to_date = ?`;
    const rows = await conn.query(SQL, [emp_no, to_date]);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

module.exports.setLastEmpDep = async function (emp_no, from_date) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL = `update dept_emp set to_date='9999-01-01' where from_date = ? and emp_no = ?`;
    const rows = await conn.query(SQL, [from_date, emp_no]);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};
