var express = require("express");
var router  = express.Router({mergeParams: true});
var Baba = require("../models/baba");
var Player = require("../models/player");
var middleware = require("../middleware");

//Players New
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find baba by id
    console.log(req.params.id);
    Baba.findById(req.params.id, function(err, baba){
        if(err){
            console.log(err);
        } else {
             res.render("players/new", {baba: baba});
        }
    })
});

//Players Create
router.post("/",middleware.isLoggedIn,function(req, res){
   //lookup baba using ID
   Baba.findById(req.params.id, function(err, baba){
       if(err){
           console.log(err);
           res.redirect("/babas");
       } else {
        Player.create(req.body.player, function(err, player){
           if(err){
               console.log(err);
           } else {
               //add username and id to player
               player.author.id = req.user._id;
               player.author.username = req.user.username;
               //save player
               player.save();
               baba.players.push(player);
               baba.save();
               console.log(player);
               req.flash('success', 'Created a player!');
               res.redirect('/babas/' + baba._id);
           }
        });
       }
   });
});

router.get("/:playerId/edit", middleware.isLoggedIn, function(req, res){
    // find baba by id
    Player.findById(req.params.playerId, function(err, player){
        if(err){
            console.log(err);
        } else {
             res.render("players/edit", {baba_id: req.params.id, player: player});
        }
    })
});

router.put("/:playerId", function(req, res){
   Player.findByIdAndUpdate(req.params.playerId, req.body.player, function(err, player){
       if(err){
          console.log(err);
           res.render("edit");
       } else {
           res.redirect("/babas/" + req.params.id);
       }
   }); 
});

router.delete("/:playerId",middleware.checkUserPlayer, function(req, res){
    Player.findByIdAndRemove(req.params.playerId, function(err, player){
        if(err){
            console.log(err);
        } else {
            Baba.findByIdAndUpdate(req.params.id, {
              $pull: {
                players: player.id
              }
            }, function(err) {
              if(err){ 
                console.log(err)
              } else {
                req.flash('error', 'Player deleted!');
                res.redirect("/babas/" + req.params.id);
              }
            });
        }
    });
});

module.exports = router;