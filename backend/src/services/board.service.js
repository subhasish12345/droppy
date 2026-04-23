const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();
const { logActivity } = require("./activity.service");

// Helper: Ensure user is completely in the board
const verifyMembership = async (boardId, userId) => {
  const membership = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: { boardId, userId },
    },
  });
  return membership;
};

const createBoard = async (ownerId, name, password) => {
  let hashedPassword = null;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const board = await prisma.$transaction(async (tx) => {
    // 1. Create board
    const newBoard = await tx.board.create({
      data: { name, ownerId, password: hashedPassword },
    });

    // 2. Add owner as admin in BoardMember table
    await tx.boardMember.create({
      data: {
        boardId: newBoard.id,
        userId: ownerId,
        role: "admin",
      },
    });

    return newBoard;
  });

  // Log activity
  await logActivity({
    boardId: board.id,
    userId: ownerId,
    actionType: "CREATE_BOARD",
    entityId: board.id,
    metadata: { name: board.name },
  });

  return board;
};

const joinBoard = async (boardId, userId, password) => {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) throw new Error("BoardNotFound");

  // Verify membership first
  const existingMember = await verifyMembership(boardId, userId);
  if (existingMember) return existingMember; // already joined

  // Verify password if board has one
  if (board.password) {
    if (!password) throw new Error("PasswordRequired");
    const isMatch = await bcrypt.compare(password, board.password);
    if (!isMatch) throw new Error("InvalidPassword");
  }

  const newMember = await prisma.boardMember.create({
    data: { boardId, userId, role: "member" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  await logActivity({
    boardId,
    userId,
    actionType: "JOIN_BOARD",
    entityId: userId,
    metadata: {},
  });

  return newMember;
};

const getBoardsForUser = async (userId) => {
  // Return boards where user is a member
  return prisma.board.findMany({
    where: {
      members: { some: { userId } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getBoardData = async (boardId, userId) => {
  // Validate membership
  const isMember = await verifyMembership(boardId, userId);
  if (!isMember) {
    throw new Error("Forbidden");
  }

  // Fetch fully included board
  return prisma.board.findUnique({
    where: { id: boardId },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      lists: {
        orderBy: { position: "asc" },
        include: {
          tasks: {
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });
};

const getBoardById = async (boardId, userId) => {
  const isMember = await verifyMembership(boardId, userId);
  if (!isMember) {
    throw new Error("Forbidden");
  }

  return prisma.board.findUnique({
    where: { id: boardId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } }
      },
      _count: {
        select: { activities: true }
      },
      lists: {
        orderBy: { position: "asc" },
        include: {
          tasks: {
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });
};

const deleteBoard = async (boardId, userId) => {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) throw new Error("BoardNotFound");
  
  if (board.ownerId !== userId) {
    throw new Error("Forbidden"); // Only owner can delete
  }

  // Schema has onDelete: Cascade, so deleting the board deletes all related lists, tasks, members, and activities automatically
  await prisma.board.delete({ where: { id: boardId } });

  return true;
};

const inviteMemberToBoard = async (boardId, ownerId, targetEmail) => {
  // Check if owner is actually admin
  const ownerMembership = await verifyMembership(boardId, ownerId);
  if (!ownerMembership || ownerMembership.role !== "admin") {
    throw new Error("Forbidden");
  }

  // Find target user by email
  const targetUser = await prisma.user.findUnique({ where: { email: targetEmail } });
  if (!targetUser) throw new Error("UserNotFound");

  // Prevent duplicate insertion
  const existingMember = await verifyMembership(boardId, targetUser.id);
  if (existingMember) throw new Error("AlreadyMember");

  const newMember = await prisma.boardMember.create({
    data: { boardId, userId: targetUser.id, role: "member" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  await logActivity({
    boardId,
    userId: ownerId,
    actionType: "INVITE_MEMBER",
    entityId: targetUser.id,
    metadata: { email: targetEmail },
  });

  return newMember;
};

module.exports = {
  verifyMembership,
  createBoard,
  getBoardsForUser,
  getBoardData,
  inviteMemberToBoard,
  joinBoard,
  deleteBoard,
  getBoardById,
};
