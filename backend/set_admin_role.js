const db = require('./db');

async function setAdminRole() {
  await db.query("UPDATE users SET role_id = 1 WHERE email = 'khoa.nguyenhoang.cit22@eiu.edu.vn' OR id = 7");
  const [rows] = await db.query(
    "SELECT u.id, u.full_name, u.email, u.role_id, r.name AS role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = 'khoa.nguyenhoang.cit22@eiu.edu.vn' OR u.id = 7"
  );
  console.log('UPDATED USER ROLE IN DB:', rows[0]);
  process.exit(0);
}

setAdminRole().catch((e) => {
  console.error(e);
  process.exit(1);
});
