var Comment = require("../models/comment");
var Baba = require("../models/baba");

module.exports = {
    isLoggedIn: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error", "You must be signed in to do that!");
        res.redirect("/login");
    },
    checkUserBaba: function(req, res, next){
        if(req.isAuthenticated()){
            Baba.findById(req.params.id, function(err, baba){
               if(baba.author.id.equals(req.user._id)){
                   next();
               } else {
                   req.flash("error", "You don't have permission to do that!");
                   console.log("BADD!!!");
                   res.redirect("/babas/" + req.params.id);
               }
            });
        } else {
            req.flash("error", "You need to be signed in to do that!");
            res.redirect("/login");
        }
    },
    checkUserComment: function(req, res, next){
        console.log("YOU MADE IT!");
        if(req.isAuthenticated()){
            Comment.findById(req.params.commentId, function(err, comment){
               if(comment.author.id.equals(req.user._id)){
                   next();
               } else {
                   req.flash("error", "You don't have permission to do that!");
                   res.redirect("/babas/" + req.params.id);
               }
            });
        } else {
            req.flash("error", "You need to be signed in to do that!");
            res.redirect("login");
        }
    },
    checkUserPlayer: function(req, res, next){
        console.log("YOU MADE IT!");
        if(req.isAuthenticated()){
            Player.findById(req.params.playerId, function(err, player){
               if(player.author.id.equals(req.user._id)){
                   next();
               } else {
                   req.flash("error", "You don't have permission to do that!");
                   res.redirect("/babas/" + req.params.id);
               }
            });
        } else {
            req.flash("error", "You need to be signed in to do that!");
            res.redirect("login");
        }
    }
}