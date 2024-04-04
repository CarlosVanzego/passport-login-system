// Import required modules
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// Function to initialize Passport
function initialize(passport, getUserByEmail, getUserById) {
  // Authentication function to check user credentials
  const authenticateUser = async (email, password, done) => {
    const user = getUserByEmail(email); // Get user by email
    if (user == null) {
      // If user not found, return error
      return done(null, false, { message: 'No user with that email' });
    }

    try {
      // Compare provided password with hashed password
      if (await bcrypt.compare(password, user.password)) {
        // If passwords match, return user
        return done(null, user);
      } else {
        // If passwords don't match, return error
        return done(null, false, { message: 'Password incorrect' });
      }
    } catch (e) {
      // If error occurs, return error
      return done(e);
    }
  };

  // Use local strategy for authentication
  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
  
  // Serialize user to store in session
  passport.serializeUser((user, done) => done(null, user.id));
  
  // Deserialize user to retrieve from session
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id));
  });
}

// Export initialize function
module.exports = initialize;