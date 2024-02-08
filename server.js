const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GitHubStrategy = require("passport-github").Strategy;
const ejs = require("ejs");
const config = require("./config");

const app = express();
const port = 3001;

app.set("view engine", "ejs");

app.use(
  session({ secret: config.secretKey, resave: true, saveUninitialized: true })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GitHubStrategy(
    {
      clientID: "6f1b0a47d50c45a71d45",
      clientSecret: "611c402f44435c3624d121d69968a9556fe702ef",
      callbackURL: "http://localhost:3001/auth/github/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

app.get("/auth/github", passport.authenticate("github"));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  }
);

app.get("/logout", isAuthenticated, (req, res) => {
  req.logout(req.user);
});

app.get("/profile", isAuthenticated, (req, res) => {
  res.send(`Welcome ${req.user.username}!`);
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
