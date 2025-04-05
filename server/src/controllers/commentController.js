import Comment from "../models/comment.js";

export const addComment = async (req, res) => {
  try {
    const { postId, text } = req.body;
    const newComment = await Comment.create({
      postId,
      text,
      userId: req.user.id,
    });
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find the comment
    const comment = await Comment.findByPk(id);

    // Check if comment exists
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the comment owner
    if (comment.userId !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own comments" });
    }

    // Delete the comment
    await comment.destroy();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
