var express = require("express");
var router  = express.Router();
var Baba = require("../models/baba");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var geocoder = require('geocoder');

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//INDEX - show all babas
router.get("/", function(req, res){
  if(req.query.search && req.xhr) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      // Get all babas from DB
      Baba.find({name: regex}, function(err, allBabas){
         if(err){
            console.log(err);
         } else {
            res.status(200).json(allBabas);
         }
      });
  } else {
      // Get all babas from DB
      Baba.find({}, function(err, allBabas){
         if(err){
             console.log(err);
         } else {
            if(req.xhr) {
              res.json(allBabas);
            } else {
              res.render("babas/index",{babas: allBabas, page: 'babas'});
            }
         }
      });
  }
});

//CREATE - add new baba to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to babas array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  var cost = req.body.cost;
  geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newBaba = {name: name, image: image, description: desc, cost: cost, author:author, location: location, lat: lat, lng: lng};
    // Create a new baba and save to DB
    Baba.create(newBaba, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to babas page
            console.log(newlyCreated);
            res.redirect("/babas");
        }
    });
  });
});

//NEW - show form to create new baba
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("babas/new"); 
});

// SHOW - shows more info about one baba
router.get("/:id", function(req, res){
    //find the baba with provided ID
    Baba.findById(req.params.id).populate("comments").exec(function(err, foundBaba){
        if(err){
          console.log(err);
        } else {
          console.log(foundBaba)
          //render show template with that baba
          res.render("babas/show", {baba: foundBaba});
        }
    });
});

router.get("/:id/edit", middleware.checkUserBaba, function(req, res){
    //find the baba with provided ID
    Baba.findById(req.params.id, function(err, foundBaba){
        if(err){
            console.log(err);
        } else {
            //render show template with that baba
            res.render("babas/edit", {baba: foundBaba});
        }
    });
});

router.put("/:id", function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newData = {name: req.body.name, image: req.body.image, description: req.body.description, cost: req.body.cost, location: location, lat: lat, lng: lng};
    Baba.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, baba){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/babas/" + baba._id);
        }
    });
  });
});

router.delete("/:id", function(req, res) {
  Baba.findByIdAndRemove(req.params.id, function(err, baba) {
    Comment.remove({
      _id: {
        $in: baba.comments
      }
    }, function(err, comments) {
      req.flash('error', baba.name + ' deleted!');
      res.redirect('/babas');
    })
  });
});

module.exports = router;

