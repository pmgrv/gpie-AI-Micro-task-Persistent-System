const db = require('../config/db');
const { distributeRewards } = require('../services/financeService');
const { validateWithAI } = require('../services/aiValidator');
exports.getTasks = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, day_number, status FROM micro_tasks ORDER BY day_number'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// ✅ PARENT
exports.priceTask = async (req, res) => { try { const { taskId, amount, parentId } = req.body; if (!taskId) { return res.status(400).json({ message: 'Invalid taskId' }); } if (amount <= 0) { return res.status(400).json({ message: 'Invalid amount' }); } const taskRes = await db.query( 'SELECT status FROM micro_tasks WHERE id=$1', [taskId] ); const task = taskRes.rows[0]; if (!task || task.status !== 'LOADED') { return res.status(400).json({ message: 'Task must be LOADED to price' }); } await db.query( 'UPDATE micro_tasks SET cost=$1, parent_id=$2, status=$3 WHERE id=$4', [amount, parentId, 'PRICED', taskId] ); res.json({ message: "Task priced successfully" }); } catch (err) { res.status(500).json({ error: err.message }); } };

// ✅ CHILD
exports.submitWork = async (req, res) => {
    try {
        const { taskId, childId, answer, duration } = req.body;
        if (!childId || !answer) {
            return res.status(400).json({ message: 'Invalid submission data' });
        }
        if (!taskId) {
            return res.status(400).json({ message: 'Invalid taskId' });
        }
        const taskRes = await db.query(
            'SELECT status FROM micro_tasks WHERE id=$1',
            [taskId]
        );

        const task = taskRes.rows[0];

        if (!task || task.status !== 'PRICED') {
            return res.status(400).json({ message: 'Task not ready for submission' });
        }
        if (duration < 5) {
            return res.status(400).json({ message: "Minimum 5 seconds required" });
        }

        await db.query(
            'UPDATE micro_tasks SET child_id = $1, child_answer = $2, status = $3 WHERE id = $4',
            [childId, answer, 'SUBMITTED', taskId]
        );

        res.json({ message: "Work submitted" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ REVIEWER
exports.reviewTask = async (req, res) => {
    const client = await db.connect();

    try {
        const { taskId, reviewerId } = req.body;

        if (!taskId || !reviewerId) {
            return res.status(400).json({ message: 'Invalid taskId or reviewerId' });
        }

        await client.query('BEGIN');

        const taskRes = await client.query(
            'SELECT * FROM micro_tasks WHERE id = $1 FOR UPDATE',
            [taskId]
        );

        const task = taskRes.rows[0];

        if (!task) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.status !== 'SUBMITTED') {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Already processed' });
        }

        const aiResult = validateWithAI(task);

        // Move to REVIEWED
        await client.query(
            'UPDATE micro_tasks SET status = $1 WHERE id = $2',
            ['REVIEWED', taskId]
        );

        // ❌ REJECT
        if (!aiResult.approved) {
            await client.query(
                'UPDATE micro_tasks SET status = $1, reviewer_id = $2 WHERE id = $3',
                ['REJECTED', reviewerId, taskId]
            );

            await client.query('COMMIT');

            return res.json({
                message: 'Task rejected',
                ai: aiResult
            });
        }

        // ✅ ACCEPT
        const result = await distributeRewards(taskId, reviewerId, client);

        await client.query('COMMIT');

        return res.json({
            message: 'Task accepted',
            result,
            ai: aiResult
        });

    } catch (err) {
        await client.query('ROLLBACK');
        return res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

// ✅ STATS (IMPORTANT FIX)
exports.getStats = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                COUNT(*) FILTER (WHERE status='LOADED') as load,
                COUNT(*) FILTER (WHERE status='PRICED') as priced,
                COUNT(*) FILTER (WHERE status='SUBMITTED') as submitted,
                COUNT(*) FILTER (WHERE status='REVIEWED') as reviewed,
                COUNT(*) FILTER (WHERE status='ACCEPTED') as accepted,
                COUNT(*) FILTER (WHERE status='REJECTED') as rejected,
                COUNT(*) as total
            FROM micro_tasks
        `);

        const stats = result.rows[0];

        const load = Number(stats.load);
        const priced = Number(stats.priced);
        const submitted = Number(stats.submitted);
        const reviewed = Number(stats.reviewed);
        const accepted = Number(stats.accepted);
        const rejected = Number(stats.rejected);
        const total = Number(stats.total);

        // 🎯 TRUST FORMULA
        const trust = total === 0 ? 0 : Math.max(0, Math.min(100,
            Math.round(
                ((accepted * 1.0) + (reviewed * 0.3) - (rejected * 0.7))
                / total * 100
            )
        ));
        res.json({
            load,
            priced,
            submitted,
            reviewed,
            accepted,
            rejected,
            trust
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};