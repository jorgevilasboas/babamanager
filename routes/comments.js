var express = require("express");
var router  = express.Router({mergeParams: true});
var Baba = require("../models/baba");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find baba by id
    console.log(req.params.id);
    Baba.findById(req.params.id, function(err, baba){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {baba: baba});
        }
    })
});

//Comments Create
router.post("/",middleware.isLoggedIn,function(req, res){
   //lookup baba using ID
   Baba.findById(req.params.id, function(err, baba){
       if(err){
           console.log(err);
           res.redirect("/babas");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
           } else {
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               baba.comments.push(comment);
               baba.save();
               console.log(comment);
               req.flash('success', 'Created a comment!');
               res.redirect('/babas/' + baba._id);
           }
        });
       }
   });
});

router.get("/:commentId/edit", middleware.isLoggedIn, function(req, res){
    // find baba by id
    Comment.findById(req.params.commentId, function(err, comment){
        if(err){
            console.log(err);
        } else {
             res.render("comments/edit", {baba_id: req.params.id, comment: comment});
        }
    })
});

router.put("/:commentId", function(req, res){
   Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, function(err, comment){
       if(err){
          console.log(err);
           res.render("edit");
       } else {
           res.redirect("/babas/" + req.params.id);
       }
   }); 
});

router.delete("/:commentId",middleware.checkUserComment, function(req, res){
    Comment.findByIdAndRemove(req.params.commentId, function(err, comment){
        if(err){
            console.log(err);
        } else {
            Baba.findByIdAndUpdate(req.params.id, {
              $pull: {
                comments: comment.id
              }
            }, function(err) {
              if(err){ 
                console.log(err)
              } else {
                req.flash('error', 'Comment deleted!');
                res.redirect("/babas/" + req.params.id);
              }
            });
        }
    });
});

module.exports = router;