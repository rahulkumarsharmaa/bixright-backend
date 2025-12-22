const express = require("express");
const popupController = require("../../controller/adminController/popupController");
const router = express.Router();
const upload = require("../../middleware/multerCloudinaryMiddleware");

router.get('/popup-data', popupController.getPopupData)
router.get('/:id', popupController.getPopupById)
router.post("/add", upload.single("image"), popupController.createPopup);
router.patch(
  "/update/:id",
  upload.single("image"),
  popupController.updatePopup
);
router.get("/get", popupController.getActivePopup);

module.exports = router;
