const db = require("../db");

exports.getQuestions = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT q.id, q.title, q.content, q.status, 
                   IFNULL(a.content, 'Pending') as answer_content
            FROM questions q
            LEFT JOIN answers a ON q.id = a.question_id
        `);
        
        const questions = rows.map(r => ({
            id: r.id.toString(),
            title: r.title,
            content: r.answer_content !== 'Pending' ? r.answer_content : r.content, // Using answer as content for simplicity in FAQ
            category: r.status === 'Answered' ? 'Answered' : 'General'
        }));

        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
