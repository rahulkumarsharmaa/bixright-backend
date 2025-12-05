<<<<<<< HEAD
const express = require('express')
const upload = require('../../middleware/multerCloudinaryMiddleware')
const { getPopupData, getPopupById, addPopup, updatePopup, deletePopup, softDeletePopup, bulkDelete } = require('../../controller/adminController/popupController')
const router = express.Router()

router.get('/popup-data', getPopupData)
router.get('/:id', getPopupById)
router.post('/add-popup', upload.single('image'), addPopup)
router.put('/update-popup/:id', updatePopup)
router.delete('/delete-popup/:id', deletePopup)
router.delete('/soft-delete-popup/:id', softDeletePopup)
router.delete('/bulk-delete', bulkDelete)

module.exports = router
=======
const express = require("express");
const popupController = require("../../controller/adminController/popupController");
const router = express.Router();
const upload = require("../../middleware/multerCloudinaryMiddleware");

router.post("/add", upload.single("image"), popupController.createPopup);
router.patch(
  "/update/:id",
  upload.single("image"),
  popupController.updatePopup
);
router.get("/get", popupController.getActivePopup);

module.exports = router;
>>>>>>> 0b076b60c5b60da135103737b78c23771c0f3c7d
