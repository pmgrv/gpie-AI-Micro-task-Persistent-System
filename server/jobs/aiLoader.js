const cron = require('node-cron');
const db = require('../config/db');

const startAiLoader = () => {
    cron.schedule('*/10 * * * * *', async () => {
 // every 10 seconds (testing) ✅ Fix for dev:
    //As working: Following Logic ⚠ Cron runs only at 4:30 AM ( Problem: If we will test during the day → no tasks generated)
    /*cron.schedule('30 4 * * *', async () => {
        console.log("AI-Auto: Generating today's task...");

        const today = new Date();
        const dayNumber = Math.ceil(
            (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
        );

        try {
            await db.query(
                `INSERT INTO micro_tasks (day_number, content, status, ai_suggested_answer)
                 VALUES ($1, $2, 'LOADED', $3)
                 ON CONFLICT (day_number) DO NOTHING`,
                [
                    dayNumber,
                    `Solve basic math for Day ${dayNumber}`,
                    `AI Answer for Day ${dayNumber}`
                ]
            );
        } catch (err) {
            console.error("AI Loader Error:", err.message);
        }
    }, { timezone: "Asia/Kolkata" });*/
    
    try {
            // ✅ GUARD: limit to 365
            const result = await db.query('SELECT COUNT(*) FROM micro_tasks');
            if (Number(result.rows[0].count) >= 365) {
                console.log("365 tasks already generated");
                return;
            }

            console.log("AI-Auto: Generating task (dev mode)...");

            await db.query(`
                INSERT INTO micro_tasks (day_number, content, status, ai_suggested_answer)
                SELECT next_day, 'Auto Task', 'LOADED', 'correct answer'
                FROM (
                    SELECT COALESCE(MAX(day_number),0)+1 as next_day FROM micro_tasks
                ) t
                WHERE next_day <= 365
                AND NOT EXISTS (
                    SELECT 1 FROM micro_tasks WHERE day_number = t.next_day
                )
            `);

        } catch (err) {    
            console.error("AI Loader Error:", err.message);
        }
    });
};

module.exports = startAiLoader;
