import Notification from '../models/notification.js';

export const getNotifications = async (req, res) => {
  try {
      if (!req.user || !req.user.id) {
          return res.status(401).json({ error: "Unauthorized" });
      }

      const notifications = await Notification.findAll({
          where: { userId: req.user.id },
          order: [["createdAt", "DESC"]],
      });

      res.status(200).json(notifications);
  } catch (error) {
      console.error("❌ Error fetching notifications:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
};


export const markAsRead = async (req, res) => {
  try {
    const { id } = req.body;
    
    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    await notification.destroy();
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting notification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
