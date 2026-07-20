const db = require("../db");

exports.getDashboard = async (req, res) => {
    try {

        // Debug
        console.log("Logged User:", req.user);

        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const userId = req.user.id;

        // ==========================
        // Parent Info
        // ==========================
        const [users] = await db.query(
            `
    SELECT
        id,
        full_name,
        email,
        avatar
    FROM users
    WHERE id = ?
    `,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const parent = users[0];

        // ==========================
        // Children
        // ==========================
        const [children] = await db.query(
            `
            SELECT
                cp.id,
                cp.name,
                cp.date_of_birth,
                cp.weight,
                cp.height,
                cp.gender,
                cp.image_url,
                GROUP_CONCAT(a.name) AS allergies
            FROM child_profiles cp
            LEFT JOIN child_allergies ca
                ON cp.id = ca.child_id
            LEFT JOIN allergies a
                ON ca.allergy_id = a.id
            WHERE cp.parent_id = ?
            GROUP BY
                cp.id,
                cp.name,
                cp.date_of_birth,
                cp.weight,
                cp.height,
                cp.gender,
                cp.image_url
            `,
            [userId]
        );

        const babies = children.map((child) => {

            let growthStatus = "Healthy Growth";

            if (
                child.weight &&
                child.height &&
                Number(child.height) > 0
            ) {

                const bmi =
                    Number(child.weight) /
                    Math.pow(
                        Number(child.height) / 100,
                        2
                    );

                if (bmi < 14) {
                    growthStatus = "Underweight";
                } else if (bmi > 18) {
                    growthStatus = "Overweight";
                }
            }

            return {
                id: child.id,
                name: child.name,
                avatar:
                    child.image_url ||
                    "https://cdn-icons-png.flaticon.com/512/7890/7890168.png",

                dateOfBirth: child.date_of_birth,

                weight:
                    child.weight
                        ? `${child.weight} kg`
                        : "N/A",

                height:
                    child.height
                        ? `${child.height} cm`
                        : "N/A",

                gender: child.gender,

                allergies:
                    child.allergies
                        ? child.allergies.split(",")
                        : [],

                growthStatus,
            };
        });

        return res.status(200).json({
            parent: {
                id: parent.id,
                fullName: parent.full_name,
                email: parent.email,
                avatar: parent.avatar || "https://static.vecteezy.com/system/resources/previews/000/423/286/original/avatar-icon-vector-illustration.jpg"
            },
            babies
        });

    } catch (err) {

        console.error(
            "DASHBOARD ERROR:",
            err
        );

        return res.status(500).json({
            message: err.message,
        });
    }
};