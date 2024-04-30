const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://Asmi:Asmi@cluster0.9g0e8vb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch((err) => {
  console.error('Error connecting to MongoDB Atlas:', err);
});

// Define User Schema
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});

const User = mongoose.model('User', UserSchema);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Signup Route
app.post('/signup', async (req, res) => {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create a new user
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });

    // Save the user to the database
    await user.save();

    console.log('User saved to the database');
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});
// DELETE route to delete user data
app.delete('/delete/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Find the user by ID and delete it from the database
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Respond with a success message
    res.status(200).json({ message: 'User data deleted successfully' });
  } catch (error) {
    // Handle errors
    console.error('Error deleting user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Login Route

app.post('/login', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch && user.username === username) {
      return res.status(200).json({ success: true, message: "Login successful" });
    } else {
      return res.status(401).json({ success: false, message: "Incorrect credentials" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "An error occurred" });
  }
});


// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
