const distributeRewards = async (taskId, reviewerId, client) => {
    const taskRes = await client.query(
        'SELECT * FROM micro_tasks WHERE id = $1',
        [taskId]
    );

    const task = taskRes.rows[0];

    const total_amount = parseFloat(task.cost || 0);
    const reviewer_cut = total_amount * 0.05;
    const child_cut = total_amount - reviewer_cut;

    await client.query(
        'UPDATE users SET balance = balance + $1 WHERE id = $2',
        [child_cut, task.child_id]
    );

    await client.query(
        'UPDATE users SET balance = balance + $1 WHERE id = $2',
        [reviewer_cut, reviewerId]
    );

    await client.query(
        'UPDATE micro_tasks SET status = $1, reviewer_id = $2 WHERE id = $3',
        ['ACCEPTED', reviewerId, taskId]
    );

    return { success: true, distributed: total_amount };
};

module.exports = { distributeRewards };