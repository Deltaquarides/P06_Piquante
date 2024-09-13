const express = require("express");
const auth = require("../middleware/auth");

const multer = require("../middleware/multer-config");
const stuffCtrl = require("../controllers/sauce");

const router = express.Router();

router.post("/", auth, multer, stuffCtrl.createSauce);
router.get("/", auth, stuffCtrl.allSauce);
router.get("/:id", auth, stuffCtrl.getOneSauce);
router.put("/:id", auth, multer, stuffCtrl.modifySauce);
router.delete("/:id", auth, stuffCtrl.deleteSauce);

router.post("/:id/like", auth, stuffCtrl.likeSauce);

module.exports = router;
