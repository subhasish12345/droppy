const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { verifyMembership } = require("./board.service");
const { logActivity } = require("./activity.service");

const createList = async (boardId, userId, title) => {
  // 1. Verify access
  const membership = await verifyMembership(boardId, userId);
  if (!membership) throw new Error("Forbidden");

  // 2. Find max position
  const lists = await prisma.list.findMany({
    where: { boardId },
    orderBy: { position: "desc" },
    take: 1,
  });

  const newPosition = lists.length > 0 ? lists[0].position + 1 : 1; // Float positional start

  // 3. Create list
  const newList = await prisma.list.create({
    data: { boardId, title, position: newPosition },
  });

  // 4. Log
  await logActivity({
    boardId,
    userId,
    actionType: "CREATE_LIST",
    entityId: newList.id,
    metadata: { title },
  });

  return newList;
};

const updateListTitle = async (listId, boardId, userId, title) => {
  const membership = await verifyMembership(boardId, userId);
  if (!membership) throw new Error("Forbidden");

  const list = await prisma.list.update({
    where: { id: listId },
    data: { title },
  });

  await logActivity({
    boardId,
    userId,
    actionType: "UPDATE_LIST",
    entityId: listId,
    metadata: { title },
  });

  return list;
};

const deleteList = async (listId, boardId, userId) => {
  const membership = await verifyMembership(boardId, userId);
  if (!membership) throw new Error("Forbidden");

  await prisma.list.delete({ where: { id: listId } });

  await logActivity({
    boardId,
    userId,
    actionType: "DELETE_LIST",
    entityId: listId,
    metadata: {},
  });
  return true;
};

module.exports = { createList, updateListTitle, deleteList };
