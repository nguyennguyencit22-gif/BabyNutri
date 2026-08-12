const db = require("../db");

exports.getMealPlans = async (req, res) => {
    try {
        const parentId = 3; 
        const childId = req.query.childId;
        
        let query = "SELECT * FROM meal_plans WHERE parent_id = ?";
        let params = [parentId];
        
        if (childId) {
            query += " AND child_id = ?";
            params.push(childId);
        }
        
        const [rows] = await db.execute(query, params);
        
        const plans = rows.map(r => ({
            id: r.id.toString(),
            childId: r.child_id.toString(),
            date: new Date(r.week_start).toISOString().split('T')[0],
            totalCalories: 0, // Placeholder
            meals: [] // To be populated in getById if needed, or joined
        }));

        res.json(plans);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getMealPlanById = async (req, res) => {
    try {
        const planId = req.params.id;
        const [plans] = await db.execute("SELECT * FROM meal_plans WHERE id = ?", [planId]);
        
        if (plans.length === 0) return res.status(404).json({ message: "Meal Plan not found" });
        const plan = plans[0];
        
        const [items] = await db.execute(`
            SELECT mpi.*, r.name as recipe_name, r.description, mt.name as meal_type_name
            FROM meal_plan_items mpi
            JOIN recipes r ON mpi.recipe_id = r.id
            JOIN meal_types mt ON mpi.meal_type_id = mt.id
            WHERE mpi.meal_plan_id = ?
        `, [planId]);

        const meals = items.map(item => ({
            id: item.id.toString(),
            name: item.meal_type_name,
            time: item.time || '',
            description: item.recipe_name,
            calories: 350 // Mocking calorie calculation for now
        }));
        
        const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

        res.json({
            id: plan.id.toString(),
            childId: plan.child_id.toString(),
            date: new Date(plan.week_start).toISOString().split('T')[0],
            totalCalories,
            meals
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
