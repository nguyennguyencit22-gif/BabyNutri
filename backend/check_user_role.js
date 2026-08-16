const db = require('./db');

async function checkUserRole() {
  const [rows] = await db.query(
    "SELECT u.id, u.full_name, u.email, u.role_id, r.name AS role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = 'khoa.nguyenhoang.cit22@eiu.edu.vn' OR u.id = 7"
  );
  console.log('USER STATUS IN DB:', rows);
  process.exit(0);
}

checkUserRole().catch((e) => {
  console.error(e);
  process.exit(1);
});
