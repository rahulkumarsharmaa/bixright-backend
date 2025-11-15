const SupportTicket = require("../../models/supportTicketModel");

const getAllSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find();
    if (!tickets) {
      return res
        .status(404)
        .json({ success: false, message: "No Tickets Available to Show" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Tickets Fetched", tickets });
      
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllSupportTickets };
