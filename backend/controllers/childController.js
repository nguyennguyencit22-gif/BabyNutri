const db = require("../db");

exports.getChildren = async (req, res) => {
    try {
        const parentId = 3; // Mocking parent ID since Auth is not fully integrated
        const [rows] = await db.execute(`
            SELECT c.*, 
                (SELECT GROUP_CONCAT(a.name) 
                 FROM child_allergies ca 
                 JOIN allergies a ON ca.allergy_id = a.id 
                 WHERE ca.child_id = c.id) as allergy_names
            FROM child_profiles c 
            WHERE c.parent_id = ?
        `, [parentId]);
        
        // Format for frontend
        const children = rows.map(row => {
            // Calculate age from date_of_birth roughly
            const age = row.date_of_birth ? new Date().getFullYear() - new Date(row.date_of_birth).getFullYear() : 0;
            return {
                id: row.id.toString(),
                name: row.name,
                age: age,
                gender: row.gender,
                height: row.height,
                weight: row.weight,
                allergies: row.allergy_names ? row.allergy_names.split(',') : [],
            };
        });

        res.json(children);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getChildById = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT c.*, 
                (SELECT GROUP_CONCAT(a.name) 
                 FROM child_allergies ca 
                 JOIN allergies a ON ca.allergy_id = a.id 
                 WHERE ca.child_id = c.id) as allergy_names
            FROM child_profiles c 
            WHERE c.id = ?
        `, [req.params.id]);

        if (rows.length === 0) return res.status(404).json({ message: "Child not found" });

        const row = rows[0];
        const age = row.date_of_birth ? new Date().getFullYear() - new Date(row.date_of_birth).getFullYear() : 0;
        
        res.json({
            id: row.id.toString(),
            name: row.name,
            age: age,
            gender: row.gender,
            height: row.height,
            weight: row.weight,
            allergies: row.allergy_names ? row.allergy_names.split(',') : [],
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

exports.createChild = async (req, res) => {
    try {
        const { name, age, gender, height, weight, allergies } = req.body;
        const parentId = 3; 
        // approximate dob from age
        const dob = new Date();
        dob.setFullYear(dob.getFullYear() - age);
        const dobString = dob.toISOString().split('T')[0];

        const [result] = await db.execute(
            `INSERT INTO child_profiles (parent_id, name, date_of_birth, gender, height, weight) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [parentId, name, dobString, gender, height, weight]
        );
        
        const newChildId = result.insertId;
        
        // Handle allergies if needed (simplified: we'll skip inserting to child_allergies to keep it simple, or insert if allergy table has matching names)
        
        res.status(201).json({ id: newChildId.toString(), ...req.body });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.updateChild = async (req, res) => {
    try {
        const { name, age, gender, height, weight } = req.body;
        const dob = new Date();
        dob.setFullYear(dob.getFullYear() - age);
        const dobString = dob.toISOString().split('T')[0];

        await db.execute(
            `UPDATE child_profiles 
             SET name = ?, date_of_birth = ?, gender = ?, height = ?, weight = ? 
             WHERE id = ?`,
            [name, dobString, gender, height, weight, req.params.id]
        );
        res.json({ id: req.params.id, ...req.body });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

exports.deleteChild = async (req, res) => {
    try {
        await db.execute(`DELETE FROM child_allergies WHERE child_id = ?`, [req.params.id]);
        await db.execute(`DELETE FROM meal_plans WHERE child_id = ?`, [req.params.id]);
        await db.execute(`DELETE FROM child_profiles WHERE id = ?`, [req.params.id]);
        res.json({ message: "Child deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
