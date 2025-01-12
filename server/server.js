const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');
dotenv.config();
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const UserModel = require('./models/user');
const TaskBoardModule = require('./models/taskboard');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Files will be saved in the 'uploads/' folder
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract Bearer token
    if (!token) {
        return res.status(403).send({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(401).send({ error: 'Unauthorized' });
        req.user = user;
        next();
    });
};

const transporter = nodemailer.createTransport({
    service: 'gmail', // your preferred email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Request password reset route
app.post('/api/request-password-reset', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await UserModel.findOne({ email });
        
        if (!user) {
            return res.status(200).send({ 
                message: 'If a user with this email exists, a password reset link will be sent.' 
            });
        }

        // Generate unique reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; 

        // Save reset token and expiry to user document
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}reset-password?token=${resetToken}`;

        // Email configuration
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset Request</h1>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this reset, please ignore this email.</p>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).send({ 
            message: 'If a user with this email exists, a password reset link will be sent.' 
        });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).send({ error: 'Error processing password reset request' });
    }
});

// Verify reset token route
app.post('/api/verify-reset-token', async (req, res) => {
    const { token } = req.body;

    try {
        const user = await UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send({ error: 'Invalid or expired reset token' });
        }

        res.status(200).send({ message: 'Token is valid' });

    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).send({ error: 'Error verifying reset token' });
    }
});

// Reset password route
app.post('/api/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const user = await UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send({ error: 'Invalid or expired reset token' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password and clear reset token fields
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).send({ message: 'Password successfully reset' });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).send({ error: 'Error resetting password' });
    }
});

// Sign up route
app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword
        });
        await newUser.save();
        res.status(201).send({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Server error' });
    }
});

// Login route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(400).send({ error: 'Invalid email or password' });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).send({ error: 'Invalid email or password' });

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).send({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).send({ error: 'Server error' });
    }
});

// Profile route
app.get('/api/profile', authenticateToken, async (req, res) => {
        
    try {
        const user = await UserModel.findById(req.user.userId);
        if (!user) {
            console.log('User not found');
            return res.status(404).send({ error: 'User not found' });
        }

        res.status(200).send({
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send({ error: 'Server error' });
    }
});

app.put('/api/profile/update', authenticateToken, upload.single('profilePicture'), async (req, res) => {
    const { name, email, password } = req.body;
    const userId = req.user.userId;

    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Update user fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        // Update profile picture
        if (req.file) {
            if (user.profilePicture) {
                fs.unlinkSync(user.profilePicture); // Delete old picture
            }
            user.profilePicture = req.file.path;
        }

        await user.save();

        res.status(200).send({
            message: 'Profile updated successfully',
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send({ error: 'Server error' });
    }
});

// Boards route
app.get("/boards", authenticateToken, async (req, res) => {
    try {
        const taskboards = await TaskBoardModule.find({ userId: req.user.userId });  
        res.json(taskboards);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});


app.post("/boards", authenticateToken, async (req, res) => {
    const { name } = req.body;
    if (!name || name.trim() === "") {
        return res.status(400).json({ message: "Board name is required" });
    }

    try {
        const taskboard = new TaskBoardModule({
            name,
            userId: req.user.userId,  // Associate the taskboard with the logged-in user
        });
        await taskboard.save();
        res.status(201).json(taskboard);
    } catch (error) {
        console.error("Error creating taskboard:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.put("/boards/:boardId", authenticateToken, async (req, res) => {
    const { boardId } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === "") {
        return res.status(400).json({ message: "Board name is required" });
    }

    try {
        const taskboard = await TaskBoardModule.findById(boardId);
        if (!taskboard) {
            return res.status(404).json({ message: "Board not found" });
        }

        // Check if the logged-in user owns the taskboard
        if (taskboard.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Unauthorized to update this taskboard" });
        }

        taskboard.name = name;
        await taskboard.save();

        res.json({ message: "Taskboard updated successfully", taskboard });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

app.delete("/boards/:boardId", authenticateToken, async (req, res) => {
    const { boardId } = req.params;

    try {
        const taskboard = await TaskBoardModule.findById(boardId);
        if (!taskboard) {
            return res.status(404).json({ message: "Board not found" });
        }

        // Check if the logged-in user owns the taskboard
        if (taskboard.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Unauthorized to delete this taskboard" });
        }

        await TaskBoardModule.findByIdAndDelete(boardId);
        res.json({ message: "Taskboard deleted" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});


app.get('/boards/:boardId', authenticateToken, async (req, res) => {
    const { boardId } = req.params;
  
    try {
      const taskboard = await TaskBoardModule.findById(boardId);
      if (!taskboard) {
        return res.status(404).json({ message: "Taskboard not found" });
      }
  
      if (taskboard.userId.toString() !== req.user.userId) {
        return res.status(403).json({ message: "Unauthorized to view this taskboard" });
      }
  
      res.json(taskboard);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
// Tasks route
app.post('/boards/:boardId/tasks', authenticateToken, async (req, res) => {
    const { boardId } = req.params;
    const { title, description } = req.body;
  
    if (!title || !description) {
      return res.status(400).json({ message: "Task title and description are required" });
    }
  
    try {
      const taskboard = await TaskBoardModule.findById(boardId);
      if (!taskboard) {
        return res.status(404).json({ message: "Taskboard not found" });
      }
  
      if (taskboard.userId.toString() !== req.user.userId) {
        return res.status(403).json({ message: "Unauthorized to add tasks to this taskboard" });
      }
  
      taskboard.tasks.push({ title, description }); // Add task to the tasks array
      await taskboard.save();
      res.status(201).json({ message: "Task added", taskboard });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put('/boards/:boardId/tasks/:taskId', authenticateToken, async (req, res) => {
    const { boardId, taskId } = req.params;
    const { title, description } = req.body;
  
    try {
      const taskboard = await TaskBoardModule.findById(boardId);
      if (!taskboard) {
        return res.status(404).json({ message: "Taskboard not found" });
      }
  
      if (taskboard.userId.toString() !== req.user.userId) {
        return res.status(403).json({ message: "Unauthorized to edit tasks in this taskboard" });
      }
  
      const task = taskboard.tasks.id(taskId); // Locate the task by its ID
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      task.title = title || task.title;
      task.description = description || task.description;
  
      await taskboard.save();
  
      res.json({ message: "Task updated", taskboard });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });


  app.delete('/boards/:boardId/tasks/:taskId', authenticateToken, async (req, res) => {
    const { boardId, taskId } = req.params;
  
    try {
      const taskboard = await TaskBoardModule.findById(boardId);
      if (!taskboard) {
        return res.status(404).json({ message: "Taskboard not found" });
      }
  
      if (taskboard.userId.toString() !== req.user.userId) {
        return res.status(403).json({ message: "Unauthorized to delete tasks in this taskboard" });
      }
  
      // Find the task by ID and remove it
      const taskIndex = taskboard.tasks.findIndex(task => task._id.toString() === taskId);
      if (taskIndex === -1) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      taskboard.tasks.splice(taskIndex, 1);

      await taskboard.save();
  
      res.json({ message: "Task deleted successfully", taskboard });
    } catch (error) {
      console.error('Error during task deletion:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

app.post("/boards/save", authenticateToken, async (req, res) => {
    const { taskBoards } = req.body;
    
    if (!Array.isArray(taskBoards)) {
        return res.status(400).json({ 
            message: "Invalid request format. Expected an array of taskBoards." 
        });
    }

    try {
        // Verify all taskboards belong to the user
        for (const board of taskBoards) {
            const existingBoard = await TaskBoardModule.findById(board._id);
            if (!existingBoard) {
                return res.status(404).json({ 
                    message: `Taskboard with id ${board._id} not found` 
                });
            }
            if (existingBoard.userId.toString() !== req.user.userId) {
                return res.status(403).json({ 
                    message: `Unauthorized to modify taskboard ${board._id}` 
                });
            }
        }

        // Update all taskboards in parallel
        const updatePromises = taskBoards.map(async (board) => {
            return TaskBoardModule.findByIdAndUpdate(
                board._id,
                {
                    $set: {
                        name: board.name,
                        tasks: board.tasks,
                        userId: req.user.userId // Ensure userId remains unchanged
                    }
                },
                { new: true } // Return updated document
            );
        });

        const updatedBoards = await Promise.all(updatePromises);
        
        res.json({
            message: "All taskboards updated successfully",
            taskBoards: updatedBoards
        });

    } catch (error) {
        console.error("Error saving taskboards:", error);
        res.status(500).json({ 
            message: "Internal server error",
            error: error.message 
        });
    }
});

// Serve static files
app.use('/uploads', express.static('uploads'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
