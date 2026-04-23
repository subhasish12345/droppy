const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { verifyMembership } = require("./board.service");
const { logActivity } = require("./activity.service");

const createTask = async (boardId, listId, userId, title, description, assignedTo, dueDate) => {
  const membership = await verifyMembership(boardId, userId);
  if (!membership) throw new Error("Forbidden");

  // Get max position in list
  const tasks = await prisma.task.findMany({
    where: { listId },
    orderBy: { position: "desc" },
    take: 1,
  });

  const newPosition = tasks.length > 0 ? tasks[0].position + 1 : 1;

  const task = await prisma.task.create({
    data: {
      listId,
      title,
      description,
      assignedTo,
      dueDate,
      position: newPosition,
    },
  });

  await logActivity({
    boardId,
    userId,
    actionType: "CREATE_TASK",
    entityId: task.id,
    metadata: { title, listId },
  });

  return task;
};

const updateTask = async (taskId, boardId, userId, data) => {
  const membership = await verifyMembership(boardId, userId);
  if (!membership) throw new Error("Forbidden");

  const task = await prisma.task.update({
    where: { id: taskId },
    data,
  });

  await logActivity({
    boardId,
    userId,
    actionType: "UPDATE_TASK",
    entityId: taskId,
    metadata: { ...data },
  });

  return task;
};

const moveTask = async (taskId, boardId, userId, newListId, position) => {
  const membership = await verifyMembership(boardId, userId);
  if (!membership) throw new Error("Forbidden");

  // Fetch the old task to track log accurately
  const oldTask = await prisma.task.findUnique({ where: { id: taskId } });

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      listId: newListId,
      position: parseFloat(position), // crucial float math injection
    },
  });

  await logActivity({
    boardId,
    userId,
    actionType: "MOVE_TASK",
    entityId: taskId,
    metadata: { 
      fromList: oldTask.listId, 
      toList: newListId, 
      newPosition: position 
    },
  });

  return task;
};

const deleteTask = async (taskId, boardId, userId) => {
  const membership = await verifyMembership(boardId, userId);
  if (!membership) throw new Error("Forbidden");

  await prisma.task.delete({ where: { id: taskId } });

  await logActivity({
    boardId,
    userId,
    actionType: "DELETE_TASK",
    entityId: taskId,
    metadata: {},
  });
  
  return true;
};

module.exports = { createTask, updateTask, moveTask, deleteTask };
