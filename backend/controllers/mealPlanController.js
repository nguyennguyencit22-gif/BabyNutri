// @ts-nocheck
const db = require("../db");

/**
 * GET /api/mealplans
 * Fetch meal plans for parent & child
 */
exports.getMealPlans = async (req, res) => {
    try {
        const parentId = req.user?.id || req.query.parentId || 3;
        const childId = req.query.childId;

        let query = "SELECT * FROM meal_plans WHERE parent_id = ?";
        let params = [parentId];

        if (childId) {
            query += " AND child_id = ?";
            params.push(childId);
        }

        query += " ORDER BY week_start DESC";

        const [rows] = await db.query(query, params);

        if (rows.length === 0) {
            return res.json([]);
        }

        const planIds = rows.map((r) => r.id);
        const [items] = await db.query(
            `
            SELECT 
                mpi.id,
                mpi.meal_plan_id,
                mpi.recipe_id,
                mpi.day_of_week,
                mpi.meal_type_id,
                mpi.portion,
                mpi.status,
                r.name AS recipe_name,
                r.description AS recipe_description,
                r.image_url AS recipe_image,
                r.calories,
                r.protein,
                r.fat,
                r.carbohydrate,
                COALESCE(mt.name, 'Meal') AS meal_type_name
            FROM meal_plan_items mpi
            JOIN recipes r ON mpi.recipe_id = r.id
            LEFT JOIN meal_types mt ON mpi.meal_type_id = mt.id
            WHERE mpi.meal_plan_id IN (?)
            ORDER BY mpi.id ASC
            `,
            [planIds]
        );

        const itemsByPlan = {};
        for (const item of items) {
            if (!itemsByPlan[item.meal_plan_id]) {
                itemsByPlan[item.meal_plan_id] = [];
            }
            itemsByPlan[item.meal_plan_id].push({
                id: item.id.toString(),
                name: `${item.meal_type_name}: ${item.recipe_name}`,
                time: item.day_of_week || '',
                description: item.recipe_description || '',
                calories: item.calories || 0,
                protein: item.protein || 0,
                fat: item.fat || 0,
                carbs: item.carbohydrate || 0,
                recipeId: item.recipe_id,
                recipeImage: item.recipe_image,
                mealType: item.meal_type_name,
                status: item.status || 'planned',
            });
        }

        const plans = rows.map((r) => {
            const planMeals = itemsByPlan[r.id] || [];
            const totalCalories = planMeals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
            const totalProtein = planMeals.reduce((sum, m) => sum + (Number(m.protein) || 0), 0);
            const totalFat = planMeals.reduce((sum, m) => sum + (Number(m.fat) || 0), 0);
            const totalCarbs = planMeals.reduce((sum, m) => sum + (Number(m.carbs) || 0), 0);

            return {
                id: r.id.toString(),
                childId: r.child_id ? r.child_id.toString() : '1',
                date: r.week_start ? new Date(r.week_start).toISOString().split('T')[0] : '',
                totalCalories,
                totalProtein: Number(totalProtein.toFixed(1)),
                totalFat: Number(totalFat.toFixed(1)),
                totalCarbs: Number(totalCarbs.toFixed(1)),
                meals: planMeals,
            };
        });

        res.json(plans);
    } catch (error) {
        console.error("getMealPlans error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/**
 * GET /api/mealplans/:id
 */
exports.getMealPlanById = async (req, res) => {
    try {
        const planId = req.params.id;
        const [plans] = await db.query("SELECT * FROM meal_plans WHERE id = ?", [planId]);

        if (plans.length === 0) return res.status(404).json({ message: "Meal Plan not found" });
        const plan = plans[0];

        const [items] = await db.query(
            `
            SELECT 
                mpi.id,
                mpi.meal_plan_id,
                mpi.recipe_id,
                mpi.day_of_week,
                mpi.meal_type_id,
                mpi.portion,
                mpi.status,
                r.name AS recipe_name,
                r.description AS recipe_description,
                r.image_url AS recipe_image,
                r.calories,
                r.protein,
                r.fat,
                r.carbohydrate,
                COALESCE(mt.name, 'Meal') AS meal_type_name
            FROM meal_plan_items mpi
            JOIN recipes r ON mpi.recipe_id = r.id
            LEFT JOIN meal_types mt ON mpi.meal_type_id = mt.id
            WHERE mpi.meal_plan_id = ?
            ORDER BY mpi.id ASC
            `,
            [planId]
        );

        const meals = items.map((item) => ({
            id: item.id.toString(),
            name: `${item.meal_type_name}: ${item.recipe_name}`,
            time: item.day_of_week || '',
            description: item.recipe_description || '',
            calories: item.calories || 0,
            protein: item.protein || 0,
            fat: item.fat || 0,
            carbs: item.carbohydrate || 0,
            recipeId: item.recipe_id,
            recipeImage: item.recipe_image,
            mealType: item.meal_type_name,
            status: item.status || 'planned',
        }));

        const totalCalories = meals.reduce((sum, meal) => sum + (Number(meal.calories) || 0), 0);
        const totalProtein = meals.reduce((sum, meal) => sum + (Number(meal.protein) || 0), 0);
        const totalFat = meals.reduce((sum, meal) => sum + (Number(meal.fat) || 0), 0);
        const totalCarbs = meals.reduce((sum, meal) => sum + (Number(meal.carbs) || 0), 0);

        res.json({
            id: plan.id.toString(),
            childId: plan.child_id ? plan.child_id.toString() : '1',
            date: plan.week_start ? new Date(plan.week_start).toISOString().split('T')[0] : '',
            totalCalories,
            totalProtein: Number(totalProtein.toFixed(1)),
            totalFat: Number(totalFat.toFixed(1)),
            totalCarbs: Number(totalCarbs.toFixed(1)),
            meals,
        });
    } catch (error) {
        console.error("getMealPlanById error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/**
 * POST /api/mealplans
 * Create or save meal plan
 */
exports.createMealPlan = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const parentId = req.user?.id || 3;
        const { childId, date, weekStart, meals = [] } = req.body;

        const planDate = weekStart || date || new Date().toISOString().split('T')[0];
        const babyId = childId || 1;

        await connection.beginTransaction();

        const [existing] = await connection.query(
            `SELECT id FROM meal_plans WHERE parent_id = ? AND child_id = ? AND week_start = ?`,
            [parentId, babyId, planDate]
        );

        let planId;
        if (existing.length > 0) {
            planId = existing[0].id;
        } else {
            const [insertRes] = await connection.query(
                `INSERT INTO meal_plans (parent_id, child_id, week_start) VALUES (?, ?, ?)`,
                [parentId, babyId, planDate]
            );
            planId = insertRes.insertId;
        }

        if (Array.isArray(meals) && meals.length > 0) {
            for (const m of meals) {
                if (!m.recipeId) continue;
                let mealTypeId = m.mealTypeId || 1;
                if (!m.mealTypeId && m.mealType) {
                    const [mtRows] = await connection.query(`SELECT id FROM meal_types WHERE name = ?`, [m.mealType]);
                    if (mtRows.length > 0) mealTypeId = mtRows[0].id;
                }

                await connection.query(
                    `INSERT INTO meal_plan_items (meal_plan_id, recipe_id, day_of_week, meal_type_id, portion, status)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [planId, m.recipeId, m.time || m.dayOfWeek || 'Mon', mealTypeId, m.portion || '1 portion', m.status || 'planned']
                );
            }
        }

        await connection.commit();
        res.status(201).json({ message: "Meal plan saved", id: planId });
    } catch (err) {
        await connection.rollback();
        console.error("createMealPlan error:", err);
        res.status(500).json({ message: "Failed to create meal plan", error: err.message });
    } finally {
        connection.release();
    }
};

/**
 * DELETE /api/mealplans/items/:itemId
 */
exports.deleteMealPlanItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        await db.query(`DELETE FROM meal_plan_items WHERE id = ?`, [itemId]);
        res.json({ message: "Meal item deleted" });
    } catch (err) {
        console.error("deleteMealPlanItem error:", err);
        res.status(500).json({ message: "Failed to delete meal item", error: err.message });
    }
};

