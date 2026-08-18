// @ts-nocheck

// Deletes a user row and every piece of data tied to it (children, favorites,
// ratings, comments, chats, meal plans, Q&A, expert content...). Issued
// explicitly in dependency order rather than relying on the schema's
// ON DELETE CASCADE, since this project's live database has repeatedly
// drifted from the tracked seed script (missing columns/tables found and
// patched several times) -- safer not to trust cascade behavior for a
// destructive, unrecoverable operation.
//
// Caller owns the transaction (beginTransaction/commit/rollback) and any
// pre/post steps (looking up firebase_uid beforehand, deleting the Firebase
// user afterward).
async function deleteUserCascade(connection, userId) {
    const [childRows] = await connection.query(
        `SELECT id FROM child_profiles WHERE parent_id = ?`,
        [userId]
    );
    const childIds = childRows.map((c) => c.id);

    if (childIds.length > 0) {
        await connection.query(`DELETE FROM child_growth_records WHERE child_id IN (?)`, [childIds]);
        await connection.query(`DELETE FROM child_allergies WHERE child_id IN (?)`, [childIds]);
        await connection.query(`DELETE FROM child_food_preferences WHERE child_id IN (?)`, [childIds]);
        await connection.query(`DELETE FROM child_known_allergies WHERE child_id IN (?)`, [childIds]);
        await connection.query(`DELETE FROM child_invitation_codes WHERE child_id IN (?)`, [childIds]);
        await connection.query(`DELETE FROM child_caregivers WHERE child_id IN (?)`, [childIds]);
    }

    const [mealPlanByParentRows] = await connection.query(
        `SELECT id FROM meal_plans WHERE parent_id = ?`,
        [userId]
    );
    let mealPlanByChildRows = [];
    if (childIds.length > 0) {
        [mealPlanByChildRows] = await connection.query(
            `SELECT id FROM meal_plans WHERE child_id IN (?)`,
            [childIds]
        );
    }
    const mealPlanIds = [...new Set([...mealPlanByParentRows, ...mealPlanByChildRows].map((m) => m.id))];
    if (mealPlanIds.length > 0) {
        await connection.query(`DELETE FROM meal_plan_items WHERE meal_plan_id IN (?)`, [mealPlanIds]);
    }
    await connection.query(`DELETE FROM meal_plans WHERE parent_id = ?`, [userId]);

    if (childIds.length > 0) {
        await connection.query(`DELETE FROM child_profiles WHERE id IN (?)`, [childIds]);
    }

    // This user as a caregiver on someone else's child.
    await connection.query(`DELETE FROM child_caregivers WHERE user_id = ?`, [userId]);
    // Invitation codes for children this user doesn't own (created or redeemed by them).
    await connection.query(`UPDATE child_invitation_codes SET created_by = NULL WHERE created_by = ?`, [userId]);
    await connection.query(`UPDATE child_invitation_codes SET used_by = NULL WHERE used_by = ?`, [userId]);

    await connection.query(`DELETE FROM favorite_recipes WHERE user_id = ?`, [userId]);
    await connection.query(`DELETE FROM recipe_ratings WHERE user_id = ?`, [userId]);
    await connection.query(`DELETE FROM recipe_comments WHERE user_id = ?`, [userId]);
    await connection.query(`DELETE FROM user_recipe_history WHERE user_id = ?`, [userId]);
    await connection.query(`DELETE FROM notifications WHERE user_id = ?`, [userId]);
    await connection.query(`DELETE FROM measurement_settings WHERE user_id = ?`, [userId]);

    const [convoRows] = await connection.query(
        `SELECT id FROM chat_conversations WHERE parent_id = ? OR expert_id = ?`,
        [userId, userId]
    );
    const convoIds = convoRows.map((c) => c.id);
    if (convoIds.length > 0) {
        await connection.query(`DELETE FROM chat_ratings WHERE conversation_id IN (?)`, [convoIds]);
        await connection.query(`DELETE FROM chat_messages WHERE conversation_id IN (?)`, [convoIds]);
        await connection.query(`DELETE FROM chat_conversations WHERE id IN (?)`, [convoIds]);
    }

    const [questionRows] = await connection.query(
        `SELECT id FROM questions WHERE parent_id = ?`,
        [userId]
    );
    const questionIds = questionRows.map((q) => q.id);
    if (questionIds.length > 0) {
        await connection.query(`DELETE FROM answers WHERE question_id IN (?)`, [questionIds]);
        await connection.query(`DELETE FROM qna_messages WHERE question_id IN (?)`, [questionIds]);
        await connection.query(`DELETE FROM question_messages WHERE question_id IN (?)`, [questionIds]);
        await connection.query(`DELETE FROM question_ratings WHERE question_id IN (?)`, [questionIds]);
    }
    await connection.query(`DELETE FROM answers WHERE expert_id = ?`, [userId]);
    await connection.query(`DELETE FROM qna_messages WHERE sender_id = ?`, [userId]);
    await connection.query(`DELETE FROM question_messages WHERE sender_id = ?`, [userId]);
    await connection.query(`DELETE FROM question_ratings WHERE user_id = ?`, [userId]);
    await connection.query(`DELETE FROM questions WHERE parent_id = ? OR expert_id = ?`, [userId, userId]);

    // Article ratings/comments -- not covered by any live FK (schema drift:
    // these tables exist without constraints), so must be deleted explicitly
    // just like their recipe counterparts above.
    await connection.query(`DELETE FROM article_ratings WHERE user_id = ?`, [userId]);
    await connection.query(`DELETE FROM article_comments WHERE user_id = ?`, [userId]);

    // Expert feedback/follows -- this user could appear on either side (as
    // the reviewer/follower, or as the Expert being reviewed/followed).
    await connection.query(`DELETE FROM expert_feedback WHERE user_id = ? OR expert_id = ?`, [userId, userId]);
    await connection.query(`DELETE FROM expert_followers WHERE user_id = ? OR expert_id = ?`, [userId, userId]);

    await connection.query(`DELETE FROM user_settings WHERE user_id = ?`, [userId]);

    // Content this user authored (as an Expert) stays, just loses attribution.
    await connection.query(`UPDATE recipes SET expert_id = NULL WHERE expert_id = ?`, [userId]);
    await connection.query(`UPDATE articles SET expert_id = NULL WHERE expert_id = ?`, [userId]);
    await connection.query(`DELETE FROM expert_profiles WHERE expert_id = ?`, [userId]);

    await connection.query(`DELETE FROM users WHERE id = ?`, [userId]);
}

module.exports = { deleteUserCascade };
