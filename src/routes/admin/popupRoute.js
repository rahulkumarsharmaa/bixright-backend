const express = require("express");
const popupController = require("../../controller/adminController/popupController");
const router = express.Router();
const upload = require("../../middleware/multerMiddleware");

router.get('/popup-data', popupController.getPopupData)
router.get('/:id', popupController.getPopupById)
router.post("/add-popup", upload('popup').single("image"), popupController.createPopup);
router.put(
  "/update-popup/:id",
  upload('popup').single("image"),
  popupController.updatePopup
);
router.delete('/soft-delete-popup/:id', popupController.softDeletePopup)
router.delete('/bulk-delete', popupController.bulkDelete)
router.get("/get", popupController.getActivePopup);

module.exports = router;
