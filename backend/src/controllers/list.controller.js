const listService = require("../services/list.service");

// POST /lists (Expects { boardId, title })
const createList = async (req, res) => {
  try {
    const { boardId, title } = req.body;
    if (!boardId || !title) return res.status(400).json({ error: "boardId and title required" });

    const list = await listService.createList(boardId, req.user.id, title);
    return res.status(201).json(list);
  } catch (err) {
    if (err.message === "Forbidden") return res.status(403).json({ error: "Access denied" });
    console.error(err);
    res.status(500).json({ error: "Failed to create list" });
  }
};

// PATCH /lists/:id
const updateList = async (req, res) => {
  try {
    const { boardId, title } = req.body;
    if (!boardId || !title) return res.status(400).json({ error: "boardId and title required" });

    const list = await listService.updateListTitle(req.params.id, boardId, req.user.id, title);
    return res.status(200).json(list);
  } catch (err) {
    if (err.message === "Forbidden") return res.status(403).json({ error: "Access denied" });
    console.error(err);
    res.status(500).json({ error: "Failed to update list" });
  }
};

// DELETE /lists/:id
const deleteList = async (req, res) => {
  try {
    const { boardId } = req.body; // Usually passed in query or body
    if (!boardId) return res.status(400).json({ error: "boardId required" });

    await listService.deleteList(req.params.id, boardId, req.user.id);
    return res.status(204).send();
  } catch (err) {
    if (err.message === "Forbidden") return res.status(403).json({ error: "Access denied" });
    console.error(err);
    res.status(500).json({ error: "Failed to delete list" });
  }
};

module.exports = { createList, updateList, deleteList };
