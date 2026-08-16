const db = require('./db');

async function testFlow() {
  const testCode = 'BN-TEST99';
  await db.query('DELETE FROM child_invitation_codes WHERE code = ?', [testCode]);
  await db.query(
    'INSERT INTO child_invitation_codes (child_id, code, created_by, status) VALUES (?, ?, ?, ?)',
    [1, testCode, 7, 'active']
  );
  console.log('Successfully inserted active test code:', testCode);

  const [rows] = await db.query(
    "SELECT * FROM child_invitation_codes WHERE code = ? AND status = 'active'",
    [testCode]
  );
  console.log('Query result:', rows[0]);

  // Clean up
  await db.query('DELETE FROM child_invitation_codes WHERE code = ?', [testCode]);
  process.exit(0);
}

testFlow().catch((e) => {
  console.error(e);
  process.exit(1);
});
