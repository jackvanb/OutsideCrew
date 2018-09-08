var express               = require("express"),
    ejs                   = require("ejs"),
    bodyParser            = require("body-parser"),
    passport              = require("passport"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    session               = require("express-session"),
    User                  = require("./models/User"),
    Group                 = require("./models/Group"),
    moment                = require("moment"),
    mongoose              = require("mongoose");
    
var app = express();
moment().format();

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(session({
    secret: "Mrs. Allen was my 10th grade CS teacher",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

var newarr = ["rusty", "jack", "rusty", "jack", "jack", "madeline"];


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));


//======================
//ROUTES
//======================

// registration routes


app.post("/register", function(req, res) {
   var username = req.body.username.trim();
   var password = req.body.password.trim();
   User.register(new User({username: username}), password, function(err, user){
       if(err){
           console.log(err);
           return res.render("home", {currentuser: req.user, isAuth: req.isAuthenticated()});
       }
      passport.authenticate("local")(req, res, function(){
         res.redirect("/setup");
      });
   });
});

//login routes

app.post("/login", passport.authenticate("local", {
    successRedirect: "/blastoff",
    failureRedirect: "/"
}), function(req, res) {
    
});

//logout route

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

//other routes

app.get("/", function(req, res) {
    res.render("home", {isAuthenticated: req.isAuthenticated(), home: true});
    // console.log(countDuplicates(test));
    // console.log(createDupArray(countDuplicates(test)));
    // console.log(createObjArray(createDupArray(countDuplicates(test))));
    var tHat = createObjArray(createDupArray(countDuplicates(test)));
    (sortDate(tHat));
    
    
  

});

app.get("/schedule", isLoggedIn, function(req, res) {
    Group.findById({"_id": req.user.groupQ}, function(err, group) {
      if(err) {
          console.log(err);
      } else {
          res.render("schedule", {group: group, isAuthenticated: req.isAuthenticated(), home: false});
          
      }
   });
});

app.get("/myschedule", isLoggedIn, function(req, res) {
    var before = createObjArray(createDupArray(countDuplicates(lineup)));
    var stuff = sortDate(before);
    console.log(stuff);
    res.render("myartists", {artists: stuff, isAuthenticated: req.isAuthenticated(), home: false, });
});

app.get("/dashboard", isLoggedIn, function(req, res) {
  if(req.user.groupQ != null) { 
   Group.findById({"_id": req.user.groupQ}, function(err, group) {
      if(err) {
          console.log(err);
      } else {
          res.render("dashboard", {group: group, isAuthenticated: req.isAuthenticated(), home: false});
          
      }
   });
} else {
    res.redirect("/blastoff");
}
    
});

app.get("/blastoff", function(req, res) {
    if(req.user.groupQ == null) {
    res.render("landing", {isAuthenticated: req.isAuthenticated(), home: false});
    } else {
        res.redirect("/dashboard");
    }
});

app.get("/blastoff2", function(req, res) {
    
    res.render("landing2", {isAuthenticated: req.isAuthenticated(), home: false, artists: newartists});
});

app.get("/submitpersonallist", function(req, res) {
    
    Group.findByIdAndUpdate(
    req.user.groupQ,
    {"users.list": lineup },
    {safe: true, upsert: true},
    function(err, model) {
        console.log(err);
    res.redirect("/dashboard");
        
    }
);
})

app.post("/joingroup", function(req, res) {
    var groupname = req.body.groupname2.trim();
    var password = req.body.password2.trim();
    
        Group.update(
        {"name": groupname, "pass": password},
        {$push: {"users": {username: req.user.username, identification: req.user._id, list: []}}},
        {safe: true, upsert: true},
        function(err, model) {
            console.log(err);
      
        Group.find({"name": groupname, "pass": password}, function(err, group) {
            if(err) {
                console.log(err);
            } else {
             
               User.findByIdAndUpdate(
                    req.user._id,
                    {"groupQ": group[0]._id},
                    {safe: true, upsert: true},
                    function(err, model) {
                        console.log(err);
                    
                        res.redirect("/blastoff2");
                    }
                );
             
             
             
                
            }
        })
   
        }
    );            
            
});

app.post("/creategroup", function(req, res) {
   var groupname = req.body.groupname.trim();
   var password = req.body.password.trim();
   
   var newGroup = {
       users: [{username: req.user.username, identification: req.user._id, list: []}],
       schedule: [],
       name: groupname,
       pass: password,
       creator: req.user.username
   }
   Group.create(newGroup, function(err, newly) {
       if(err) {
           console.log(err);
       } else {
           
           User.findByIdAndUpdate(req.user._id, {groupId: newly._id}, function(err, updated) {
               if(err){
                   console.log(err);
               } else {
                   res.redirect("/blastoff2");
               }
           });
           
           
       }
   });
});
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The Server Has Started!");
});


//============
// FUNCTIONS
//============

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }

    res.redirect("/");
}

function convertTime (date) {
    var newdate = moment(date);
    console.log(newdate);
    return newdate;
}

function sortDate(arr) {
    var two = [];
    for(var i = 0; i < arr.length; i++) {
            two.push([arr[i], getvalue(arr[i])]);
        }
    // two.sort(sortFunction);
    two.sort(function(a, b) { return (a[1] < b[1] ? -1 : (a[1] > b[1] ? 1 : 0)); });
    console.log(two);
    return two;
}

// function sortFunction(a, b) {
//     if (a[1] === b[1]) {
//         return 0;
//     }
//     else {
//         return (a[1] < b[1]) ? -1 : 1;
//     }
// }

function getvalue (thing) {
    return Date.parse(thing.starttime);
}


var test = ["J. Cole", "J. Cole", "St. Lucia", "Polica", "St. Lucia", "Lettuce", "Polica"];

function countDuplicates(arr) {

    var duplications = { };
    
    for(var i = 0; i < arr.length; ++i) {
        if(!duplications[arr[i]])
            duplications[arr[i]] = 0;
        ++duplications[arr[i]];
    }

    return duplications;
    
}

function getThisTime(date) {
    var hour = date.getHours() + 1;
    var minutes = date.getMinutes();
    var ispm = false;
    
    if(hour > 12) {
        hour = hour - 12;
        ispm = true;
    }
    if(ispm) {
        return hour + ":" + minutes + "pm";
    } else {
        return hour + ":" + minutes + "am";
    }
        
}

function getWordOff(date){
    var day = date.getDate();
    if(day == 5){
        day = "Friday";
    } 
    if(day == 6){
        day = "Saturday";
    }
    if(day == 7) {
        day = "Sunday";
    }

    return day;
}

function createDupArray(obj) {
    var keysSorted = Object.keys(obj).sort(function(a,b){
        return obj[b]-obj[a];
    });
    return keysSorted;
}

function createObjArray(arr) {
    var arraytoreturn = [];
    arr.forEach(function(thing) {
       artists.forEach(function(artist) {
          if(artist.name == thing) {
              arraytoreturn.push(artist);
          } 
       }); 
    });

    return arraytoreturn;
}

// artists.sort(function(a, b)
//     var dateA = new Date(a.starttime);
//     var dateB = new Date(b.starttime);
//     return dateB - dateA;
//     })
    

//============
// DATA
//============

var myarray = [""]

mongoose.connect("mongodb://localhost/outside");















var artists = [
    {name: "J. Cole" , starttime: new Date("August 5, 2016 20:40:00"), endtime: new Date("August 5, 2016 21:55:00"), image: "https://upload.wikimedia.org/wikipedia/commons/0/02/J._Cole.jpg"},
    {name: "LCD Soundsystem", starttime: new Date("August 5, 2016 20:10:00"), endtime: new Date("August 5, 2016 21:55:00"), image: "http://static.stereogum.com/uploads/2016/01/LCD-Soundsystem.jpg"},
    {name: "Duran Duran" , starttime: new Date("August 5, 2016 18:15:00"), endtime: new Date("August 5, 2016 19:25:00"), image: "http://d1ya1fm0bicxg1.cloudfront.net/2015/06/promoted-media_557f0e43a9fe1.jpg"},
    {name: "Beach House" , starttime: new Date("August 5, 2016 19:50:00"), endtime: new Date("August 5, 2016 21:00:00"), image: "https://media.npr.org/assets/music/programs/worldcafe/2010/02/beachhouse_wide-148efe198bd59c08e6512a12c83b4fb2d5f18464.jpg?s=1400"},
    {name: "Grimes" , starttime: new Date("August 5, 2016 18:50:00"), endtime: new Date("August 5, 2016 19:50:00"), image: "http://res.cloudinary.com/thefader/image/upload/c_limit,w_1024/c_crop,h_1109,w_2048,x_0,y_43/grimes-onset_nlzdxd.jpg"},
    {name: "Miike Snow" , starttime: new Date("August 5, 2016 16:45:00"), endtime: new Date("August 5, 2016 17:45:00"), image: "http://www.straight.com/files/v3/images/16/01/miikesnowband_160112.jpg"},
    {name: "Nathaniel Rateliff & The Night Sweats" , starttime: new Date("August 5, 2016 18:30:00"), endtime: new Date("August 5, 2016 19:20:00"), image: "http://static1.squarespace.com/static/554babe2e4b0e66924e4a375/556cd144e4b09d61195db526/55b818a1e4b0161d507f072b/1438128291633/Nathaniel+Rateliff+and+the+Night+Sweats_PhotoCredit_Malia+James_BandGeneral1.jpg?format=750w"},
    {name: "Thomas Jack" , starttime: new Date("August 5, 2016 17:15:00"), endtime: new Date("August 5, 2016 18:05:00"), image: "http://www.thissongslaps.com/wp-content/uploads/2015/07/thomas-jack.jpg"},
    {name: "Foals" , starttime: new Date("August 5, 2016 15:50:00"), endtime: new Date("August 5, 2016 16:40:00"), image: "http://musictour.eu/data//uploads/media/albums/1309/dd1ba47b5b6dcf66cb438ddb6316160a.jpg"},
    {name: "The Claypool Lennon Delirium" , starttime: new Date("August 5, 2016 17:10:00"), endtime: new Date("August 5, 2016 18:00:00"), image: "http://cdn1-www.craveonline.com/assets/uploads/2016/03/les_sean.jpg"},
    {name: "St. Lucia" , starttime: new Date("August 5, 2016 15:25:00"), endtime: new Date("August 5, 2016 16:15:00"), image: "http://images3.mtv.com/uri/mgid:uma:video:mtv.com:1196562?width=657&height=370&crop=true&quality=0.85"},
    {name: "Polica" , starttime: new Date("August 5, 2016 15:40:00"), endtime: new Date("August 5, 2016 16:30:00"), image: "https://media.npr.org/assets/img/2012/03/01/POLICA_ColinKerrigan_wide-06141e3a39d149d4b1ed7021d56e2266df305848.jpg?s=1400"},
    {name: "Hiatus Kaiyote" , starttime: new Date("August 5, 2016 19:50:00"), endtime: new Date("August 5, 2016 20:35:00"), image: "https://img.washingtonpost.com/rf/image_1484w/2010-2019/WashingtonPost/2013/11/08/Style/Images/2595_HiatusKaiyote%20luke%20david%20kellet%20.jpg?uuid=p51DHkizEeO_DM6_N8b0hA"},
    {name: "Ra Ra Riot" , starttime: new Date("August 5, 2016 14:05:00"), endtime: new Date("August 5, 2016 14:55:00"), image: "http://www.gangstersaysrelax.com/storage/RARARIOT.jpg?__SQUARESPACE_CACHEVERSION=1451944902137"},
    {name: "Tokimonsta" , starttime: new Date("August 5, 2016 16:30:00"), endtime: new Date("August 5, 2016 17:10:00"), image: "http://www.konbini.com/us/files/2016/02/tokimonsta-009.jpg"},
    {name: "Wet" , starttime: new Date("August 5, 2016 14:30:00"), endtime: new Date("August 5, 2016 15:20:00"), image: "http://a3.files.fashionista.com/image/upload/c_fit,cs_srgb,dpr_1.0,q_80,w_620/MTI5NjUyMjE2NDE5MDk1ODI2.jpg"},
    {name: "Jidenna" , starttime: new Date("August 5, 2016 14:10:00"), endtime: new Date("August 5, 2016 14:55:00"), image: "http://imagesmtv-a.akamaihd.net/uri/mgid:ao:image:mtv.com:106631?quality=0.8&format=jpg&width=980&height=551"},
    {name: "Lapsley" , starttime: new Date("August 5, 2016 18:05:00"), endtime: new Date("August 5, 2016 18:55:00"), image: "http://xlrecordings.com/images/videos/Cliff_image.jpg"},
    {name: "Marian Hill" , starttime: new Date("August 5, 2016 12:45:00"), endtime: new Date("August 5, 2016 13:30"), image: "http://blahblahblahscience.com/wp-content/uploads/2014/12/marianhill.jpg"},
    {name: "Caveman" , starttime: new Date("August 5, 2016 13:15:00"), endtime: new Date("August 5, 2016 14:00:00"), image: "http://www.interviewmagazine.com/files/2012/01/20/img-caveman_164053731040.jpg"},
    {name: "VulfPeck" , starttime: new Date("August 5, 2016 14:55:00"), endtime: new Date("August 5, 2016 15:35:00"), image: "http://realfeelstv.com/wp-content/uploads/sites/5/2015/04/042415_theblindpig_vulfpeck_0422.jpg"},
    {name: "Moon Taxi" , starttime: new Date("August 5, 2016 13:30:00"), endtime: new Date("August 5, 2016 14:10:00"), image: "http://clture.org/wp-content/uploads/2015/03/moontaxi4.jpg"},
    {name: "Lany" , starttime: new Date("August 5, 2016 12:45:00"), endtime: new Date("August 5, 2016 13:35:00"), image: "https://img.buzzfeed.com/buzzfeed-static/static/2015-06/11/20/campaign_images/webdr02/tell-us-about-yourselfie-lany-2-28422-1434067856-0_dblbig.jpg"},
    {name: "Whitney" , starttime: new Date("August 5, 2016 12:00:00"), endtime: new Date("August 5, 2016 12:45:00"), image: "https://i.ytimg.com/vi/CGKN6qiDqnk/maxresdefault.jpg"},
    {name: "Redlight" , starttime: new Date("August 5, 2016 16:30:00"), endtime: new Date("August 5, 2016 18:00:00"), image: "http://dontpaniconline.com/media/magazine/body/2011-07-26/images/R2.jpg"},
    {name: "Pillowtalk" , starttime: new Date("August 5, 2016 18:00:00"), endtime: new Date("August 5, 2016 20:00:00"), image: "http://www.animalstylerecords.com/website/photos/animalstylerecs_825852354.JPG"},
    {name: "FDVM" , starttime: new Date("August 5, 2016 15:00:00"), endtime: new Date("August 5, 2016 16:30:00"), image: "https://edmboutique.com/wp-content/uploads/2015/08/FDVM.jpg"},
    {name: "219 Boys" , starttime: new Date("August 5, 2016 13:30:00"), endtime: new Date("August 5, 2016 15:00:00"), image: "https://cdn-assets.insomniac.com/styles/event_detail_image/s3/images/artist/219_boys.jpg?itok=ZTvam0f-"},
    {name: "Make It Funky DJs" , starttime: new Date("August 5, 2016 12:00:00"), endtime: new Date("August 5, 2016 13:30:00"), image: "http://s3.amazonaws.com/dostuff-production/band_alternate_photo/custom_photos/71035/customc86c6a907c8bc8035e85c1674876e700.png"},
    {name: "Radiohead" , starttime: new Date("August 6, 2016 19:55:00"), endtime: new Date("August 6, 2016 21:55:00"), image: "https://consequenceofsound.files.wordpress.com/2016/05/radiohead.jpg"},
    {name: "Zedd" , starttime: new Date("August 6, 2016 20:40:00"), endtime: new Date("August 6, 2016 21:55:00"), image: "http://images1.mtv.com/uri/mgid:file:docroot:mtv.com:/shared/promoimages/bands/z/zedd/a_z/2015/umg/zedd3.jpg?enlarge=false&matte=true&matteColor=black&quality=0.85"},
    {name: "Air" , starttime: new Date("August 6, 2016 18:10:00"), endtime: new Date("August 6, 2016 19:10:00"), image: "http://blog.turntablelab.com/wp-content/uploads/2015/06/sentireascoltare-Air-Band-1200x675.jpg"},
    {name: "Sufjan Stevens" , starttime: new Date("August 6, 2016 18:35:00"), endtime: new Date("August 6, 2016 19:45:00"), image: "http://cdn.pitchfork.com/longform/123/sufjan1440x8102.jpg"},
    {name: "Halsey" , starttime: new Date("August 6, 2016 18:55:00"), endtime: new Date("August 6, 2016 19:55:00"), image: "https://static01.nyt.com/images/2015/08/09/arts/09HALSEY/09HALSEY-facebookJumbo.jpg"},
    {name: "Big Grams (Big Boi + Phantogram)" , starttime: new Date("August 6, 2016 16:40:00"), endtime: new Date("August 6, 2016 17:40:00"), image: "http://cdn4.pitchfork.com/news/61063/18ea4cda.jpg"},
    {name: "The Last Shadow Puppets" , starttime: new Date("August 6, 2016 17:15:00"), endtime: new Date("August 6, 2016 18:05:00"), image: "https://consequenceofsound.files.wordpress.com/2016/03/02-the-last-shadow-puppets.jpg?w=807"},
    {name: "Lord Huron" , starttime: new Date("August 6, 2016 15:45:00"), endtime: new Date("August 6, 2016 16:55:00"), image: "http://images.popmatters.com/news_art/l/lord-huron-2015-promo-650.jpg"},
    {name: "Jauz" , starttime: new Date("August 6, 2016 17:15:00"), endtime: new Date("August 6, 2016 18:05:00"), image: "http://static1.squarespace.com/static/5570cf52e4b0aad81680a859/t/5570f904e4b028030018d2cf/1433467150167/IMG_0377-2.jpg?format=1500w"},
    {name: "Vince Staples" , starttime: new Date("August 6, 2016 15:40:00"), endtime: new Date("August 6, 2016 16:30:00"), image: "http://cdn.pitchfork.com/features/9489/30bedd30.jpg"},
    {name: "Years & Years" , starttime: new Date("August 6, 2016 15:20:00"), endtime: new Date("August 6, 2016 16:10:00"), image: "http://www.unrealitytv.co.uk/wp-content/uploads/2016/05/years-years2.jpg"},
    {name: "Ibeyi" , starttime: new Date("August 6, 2016 14:35:00"), endtime: new Date("August 6, 2016 15:25:00"), image: "http://www.ibeyi.fr/stylesheets/images/about-one.jpg"},
    {name: "Peaches" , starttime: new Date("August 6, 2016 18:05:00"), endtime: new Date("August 6, 2016 18:50:00"), image: "http://brightondome.org/images/content/24/main/6a08bbf8d3c0b1ea73c2a2d40b9cbdd1_0.jpg"},
    {name: "Con Brio" , starttime: new Date("August 6, 2016 16:30:00"), endtime: new Date("August 6, 2016 17:10:00"), image: "http://www.thebandconbrio.com/home/wp-content/uploads/2011/09/12593966_10208689009652744_3943816700261817466_o.jpg"},
    {name: "Lewis Del Mar" , starttime: new Date("August 6, 2016 12:45:00"), endtime: new Date("August 6, 2016 13:30:00"), image: "http://www.billboard.com/files/styles/article_main_image/public/media/Lewis-Del-Mar-press-2016-billboard-650.jpg"},
    {name: "Julien Baker" , starttime: new Date("August 6, 2016 12:00:00"), endtime: new Date("August 6, 2016 12:45:00"), image: "https://cdn0.vox-cdn.com/thumbor/CfvqDS1bAoJG9-XuL_25vb8c2KU=/0x0:2500x1667/1280x854/cdn0.vox-cdn.com/uploads/chorus_image/image/49147817/akrales_160317_0972_A_0009.0.0.png"},
    {name: "Purple Disco Machine" , starttime: new Date("August 6, 2016 17:30:00"), endtime: new Date("August 6, 2016 18:30:00"), image: "https://ichef.bbci.co.uk/images/ic/976x549/p03c0wm8.jpg"},
    {name: "Victor Calderone" , starttime: new Date("August 6, 2016 18:30:00"), endtime: new Date("August 6, 2016 20:00:00"), image: "http://www.djsets.co.uk/Compilations/victorcalderone/logo2.jpg"},
    {name: "Lionel Richie" , starttime: new Date("August 7, 2016 20:05:00"), endtime: new Date("August 7, 2016 21:35:00"), image: "http://imgs.l4lmcdn.com/lionel.jpg"},
    {name: "Lana Del Ray" , starttime: new Date("August 7, 2016 20:25:00"), endtime: new Date("August 7, 2016 21:35:00"), image: "http://www.billboard.com/files/styles/article_main_image/public/media/Lana-Del-Rey-Press-Photo-2015-Billboard-650.jpg"},
    {name: "Major Lazer" , starttime: new Date("August 7, 2016 18:25:00"), endtime: new Date("August 7, 2016 19:25:00"), image: "http://youredm.youredm1.netdna-cdn.com/wp-content/uploads/2016/06/major-lazer2.jpg?717214"},
    {name: "Ryan Adams and The Shining" , starttime: new Date("August 7, 2016 18:35:00"), endtime: new Date("August 7, 2016 19:50:00"), image: "http://1.bp.blogspot.com/-J4wIYF-I_ik/VSxkxF5stxI/AAAAAAABVYo/oPyFAXAo2Oc/s1600/Ryan%2BAdams%2B2015%2BCoachella%2BValley%2BMusic%2BArts%2B_kcifEP50BNl.jpg"},
    {name: "Chance The Rapper" , starttime: new Date("August 7, 2016 16:55:00"), endtime: new Date("August 7, 2016 17:55:00"), image: "http://pigeonsandplanes.com/wp-content/uploads/2016/06/chance-the-rapper-university-of-chicago.jpg"},
    {name: "Miguel" , starttime: new Date("August 7, 2016 18:40:00"), endtime: new Date("August 7, 2016 19:40:00"), image: "https://cmga360music.files.wordpress.com/2015/07/sop-dan-hallmaninvis_vale.jpg"},
    {name: "Jason Isbell" , starttime: new Date("August 7, 2016 17:15:00"), endtime: new Date("August 7, 2016 18:05:00"), image: "http://mediad.publicbroadcasting.net/p/wunc/files/201411/Jason_Isbell.jpg"},
    {name: "Third Eye Blind" , starttime: new Date("August 7, 2016 15:25:00"), endtime: new Date("August 7, 2016 16:25:00"), image: "http://ww2.kqed.org/pop/wp-content/uploads/sites/12/2016/02/635615826830590422-CINCpt-09-27-2013-Enquirer-1-E003-2013-09-25-IMG-third-eye-blind-band-1-1-O957TD3D-L292162850-IMG-third-eye-blind-band-1-1-O957TD3D-e1454710611530-1920x1173.jpg"},
    {name: "Kehlani" , starttime: new Date("August 7, 2016 17:05:00"), endtime: new Date("August 7, 2016 17:55:00"), image: "http://www.mtv.co.uk/sites/default/files/styles/image-w-760-scale/public/mtv_uk/articles/2015/12/09/kehlani_twu.jpg?itok=4afGa1rE"},
    {name: "Griz" , starttime: new Date("August 7, 2016 15:30:00"), endtime: new Date("August 7, 2016 16:20:00"), image: "http://tealbluemanagement.com/wp-content/uploads/2016/01/9.jpeg"},
    {name: "Shakehips" , starttime: new Date("August 7, 2016 14:00:00"), endtime: new Date("August 7, 2016 14:45:00"), image: "http://d2118lkw40i39g.cloudfront.net/wp-content/uploads/2016/04/1401x788-Snakehips.jpg"},
    {name: "Lettuce" , starttime: new Date("August 7, 2016 19:40:00"), endtime: new Date("August 7, 2016 20:30:00"), image: "http://www.wakarusa.com/files/2013/12/lettuce-wakarusa-2014.jpg"},
    {name: "Oh Wonder" , starttime: new Date("Augsut 7, 2016 13:15:00"), endtime: new Date("August 7, 2016 14:00:00"), image: "http://1v98is2jb24z318cse1nw6t2.wpengine.netdna-cdn.com/wp-content/uploads/2016/02/OhWonder_PressPhoto.jpg"},
    {name: "DIIV" , starttime: new Date("August 7, 2016 16:20:00"), endtime: new Date("August 7, 2016 17:00:00"), image: "https://www.filepicker.io/api/file/iYttS9hsTteHldcJwXZc/convert?cache=true&crop=0%2C16%2C1770%2C885"},
    {name: "Cloves" , starttime: new Date("August 7, 2016 13:20:00"), endtime: new Date("August 7, 2016 14:00:00"), image: "http://the-radical.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-04-at-11.54.59-AM-990x620.png"},
    {name: "Gina Turner" , starttime: new Date("August 7, 2016 16:30:00"), endtime: new Date("August 7, 2016 18:00:00"), image: "http://a.djmag.com/sites/default/files/article/image/Gina%20Turner%20top.jpg"},
    {name: "Lee K" , starttime: new Date("August 7, 2016 18:00:00"), endtime: new Date("August 7, 2016 20:00:00"), image: "http://musicis4lovers.com/wp-content/uploads/2016/05/lee-k-ft.jpg"},
    {name: "Derek Hena" , starttime: new Date("August 7, 2016 13:30:00"), endtime: new Date("August 7, 2016 15:00:00"), image: "https://assets.miamimusicweek.com/production/artist/3576/image/Derek-Hena.jpg"},
      ];
      
     var newartists = JSON.parse(JSON.stringify(artists));
    newartists.forEach(function(artist) {
        artist.starttime = getThisTime(new Date(artist.starttime));
        artist.endtime = getThisTime(new Date(artist.endtime)) + " on " +  getWordOff(new Date(artist.endtime));
    });
    
    var lineup = ["J. Cole", "Thomas Jack", "Air", "Jauz", "Jason Isbell", "Cloves"];