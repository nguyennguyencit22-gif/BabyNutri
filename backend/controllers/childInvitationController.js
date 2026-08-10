// @ts-nocheck
const db = require("../db");

function generateCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let suffix = "";

    for (let i = 0; i < 6; i++) {
        suffix += chars[Math.floor(Math.random() * chars.length)];
    }

    return `BN-${suffix}`;
}

// ==========================================
// POST /api/children/:childId/invitations
// Only the owner caregiver can invite others.
// Returns the current active code, generating
// one if none exists yet (idempotent — reusing
// the "Copy baby's code" action doesn't spam
// new rows every tap).
// ==========================================
exports.getOrCreateInvitation = async (req, res) => {
    try {
        const userId = req.user.id;
        const childId = req.params.childId;

        const [caregiverRows] = await db.query(
            `SELECT permission FROM child_caregivers WHERE child_id = ? AND user_id = ?`,
            [childId, userId]
        );

        if (caregiverRows.length === 0) {
            return res.status(404).json({
                message: "Baby profile not found.",
            });
        }

        if (caregiverRows[0].permission !== "owner") {
            return res.status(403).json({
                message:
                    "Only the owner can generate an invitation code for this baby.",
            });
        }

        const [existing] = await db.query(
            `
            SELECT code
            FROM child_invitation_codes
            WHERE child_id = ? AND status = 'active'
            ORDER BY id DESC
            LIMIT 1
            `,
            [childId]
        );

        if (existing.length > 0) {
            return res.json({ code: existing[0].code });
        }

        // Extremely unlikely to collide (36^6 possibilities), but guard
        // against the unique constraint anyway rather than trust luck.
        let code;
        for (let attempt = 0; attempt < 5; attempt++) {
            code = generateCode();

            try {
                await db.query(
                    `
                    INSERT INTO child_invitation_codes (child_id, code, created_by)
                    VALUES (?, ?, ?)
                    `,
                    [childId, code, userId]
                );
                break;
            } catch (err) {
                if (err.code !== "ER_DUP_ENTRY" || attempt === 4) {
                    throw err;
                }
            }
        }

        return res.status(201).json({ code });
    } catch (err) {
        console.error("getOrCreateInvitation error:", err);
        return res.status(500).json({
            message: "Failed to generate invitation code",
        });
    }
};

// ==========================================
// POST /api/invitations/activate
// Body: { code }
// Adds the logged-in user as an 'editor'
// caregiver of the code's baby profile, then
// retires the code (one-time use — see the
// migration notes on child_invitation_codes).
// ==========================================
exports.activateInvitation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { code } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({
                message: "Invitation code is required.",
            });
        }

        const normalizedCode = code.trim().toUpperCase();

        const [rows] = await db.query(
            `
            SELECT id, child_id
            FROM child_invitation_codes
            WHERE code = ? AND status = 'active'
            `,
            [normalizedCode]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Invalid or already-used invitation code.",
            });
        }

        const invitation = rows[0];

        const [alreadyCaregiver] = await db.query(
            `SELECT permission FROM child_caregivers WHERE child_id = ? AND user_id = ?`,
            [invitation.child_id, userId]
        );

        if (alreadyCaregiver.length === 0) {
            await db.query(
                `
                INSERT INTO child_caregivers (child_id, user_id, permission)
                VALUES (?, ?, 'editor')
                `,
                [invitation.child_id, userId]
            );
        }

        await db.query(
            `
            UPDATE child_invitation_codes
            SET status = 'used', used_by = ?, used_at = NOW()
            WHERE id = ?
            `,
            [userId, invitation.id]
        );

        return res.json({
            message: "Invitation code activated.",
            childId: invitation.child_id,
        });
    } catch (err) {
        console.error("activateInvitation error:", err);
        return res.status(500).json({
            message: "Failed to activate invitation code",
        });
    }
};
