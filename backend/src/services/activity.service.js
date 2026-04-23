const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const logActivity = async ({ boardId, userId, actionType, entityId, metadata }) => {
  try {
    await prisma.activity.create({
      data: {
        boardId,
        userId,
        actionType,
        entityId,
        metadata: metadata || {},
      },
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
    // Non-blocking log failure
  }
};

module.exports = { logActivity };
