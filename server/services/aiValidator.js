const validateWithAI = (task) => {
    // Dummy AI logic (replace later with OpenAI/ML)
    if (!task.child_answer) return { approved: false };
    const isCorrect = task.child_answer.toLowerCase().includes("correct");
    return {
        approved: isCorrect,
        confidence: isCorrect ? 0.9 : 0.2
    };
};

module.exports = { validateWithAI };