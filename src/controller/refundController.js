const initiateRefund = async (req, res) => {
  try {
    
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

module.exports = { initiateRefund };
