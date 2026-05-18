const combosRepository = require("./combos.repository");

exports.getActive = async (req, res, next) => {
  try {
    const [rows] = await combosRepository.getActive();
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};
