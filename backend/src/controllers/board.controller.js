const boardService = require("../services/board.service");

// POST /boards
const createBoard = async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const board = await boardService.createBoard(req.user.id, name, password);
    return res.status(201).json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create board" });
  }
};

// POST /boards/:id/join
const joinBoard = async (req, res) => {
  try {
    const { password } = req.body;
    const member = await boardService.joinBoard(req.params.id, req.user.id, password);
    return res.status(200).json(member);
  } catch (err) {
    if (err.message === "BoardNotFound") return res.status(404).json({ error: "Board not found" });
    if (err.message === "PasswordRequired") return res.status(400).json({ error: "Password required to join this board" });
    if (err.message === "InvalidPassword") return res.status(401).json({ error: "Invalid password" });
    
    console.error(err);
    res.status(500).json({ error: "Failed to join board" });
  }
};

// GET /boards
const getBoards = async (req, res) => {
  try {
    const boards = await boardService.getBoardsForUser(req.user.id);
    return res.status(200).json(boards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load boards" });
  }
};

// GET /boards/:id
const getBoardById = async (req, res) => {
  try {
    const board = await boardService.getBoardById(req.params.id, req.user.id);
    if (!board) return res.status(404).json({ error: "Board not found" });
    return res.status(200).json(board);
  } catch (err) {
    if (err.message === "Forbidden") return res.status(403).json({ error: "Access denied" });
    console.error(err);
    res.status(500).json({ error: "Failed to load board details" });
  }
};

// POST /boards/:id/invite
const inviteMember = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const member = await boardService.inviteMemberToBoard(req.params.id, req.user.id, email);
    return res.status(201).json(member);
  } catch (err) {
    if (err.message === "Forbidden") return res.status(403).json({ error: "Access denied" });
    if (err.message === "UserNotFound") return res.status(404).json({ error: "User not found" });
    if (err.message === "AlreadyMember") return res.status(409).json({ error: "User is already a member" });
    
    console.error(err);
    res.status(500).json({ error: "Failed to invite member" });
  }
};

// DELETE /boards/:id
const deleteBoard = async (req, res) => {
  try {
    await boardService.deleteBoard(req.params.id, req.user.id);
    return res.status(200).json({ message: "Board deleted successfully" });
  } catch (err) {
    if (err.message === "BoardNotFound") return res.status(404).json({ error: "Board not found" });
    if (err.message === "Forbidden") return res.status(403).json({ error: "Only the owner can delete this board" });
    console.error(err);
    res.status(500).json({ error: "Failed to delete board" });
  }
};

module.exports = { createBoard, getBoards, getBoardById, inviteMember, joinBoard, deleteBoard };
