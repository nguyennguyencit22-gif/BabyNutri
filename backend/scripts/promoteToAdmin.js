/**
 * promoteToAdmin.js
 *
 * Grants the Admin role to an existing account, identified by email.
 *
 * WHY THIS SCRIPT EXISTS (instead of an in-app "Become Admin" action):
 * Admin is the highest-privilege role in BabyNutri (can manage Experts,
 * view system-wide reports, etc.), so becoming an Admin is deliberately
 * NOT reachable through the mobile app or any public API endpoint —
 * there is no request a client can send that grants this role. The only
 * way to promote an account is to run this script directly on the
 * server/database, which requires real server access, not just an app
 * login. That is what keeps privilege escalation from being something
 * any logged-in user could trigger.
 *
 * The account must already exist (i.e. the person has signed up/logged
 * into the app at least once via Google Sign-In) — this script only
 * changes an existing user's role, it never creates a login credential.
 *
 * USAGE (run from the backend/ directory):
 *   node scripts/promoteToAdmin.js <email>
 *
 * Example:
 *   node scripts/promoteToAdmin.js nhanbear123@gmail.com
 */
const db = require("../db");

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error("Usage: node scripts/promoteToAdmin.js <email>");
        process.exit(1);
    }

    const [users] = await db.query(
        `SELECT u.id, u.full_name, u.email, r.name AS role
         FROM users u JOIN roles r ON u.role_id = r.id
         WHERE u.email = ?`,
        [email]
    );

    if (!users.length) {
        console.error(`No account found with email "${email}". They must sign up in the app first.`);
        process.exit(1);
    }

    const user = users[0];
    if (user.role === "Admin") {
        console.log(`${user.email} is already an Admin.`);
        process.exit(0);
    }

    await db.query(`UPDATE users SET role_id = 1 WHERE id = ?`, [user.id]);
    console.log(`Promoted "${user.full_name}" (${user.email}) from ${user.role} to Admin.`);
    process.exit(0);
}

main().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
});
