const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const productsRouter = require('./routes/products');
const billRouter = require('./routes/bill');
const authRouter = require('./routes/auth');

dotenv.config();
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set to a random secret of at least 32 characters');
}

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/send-bill', billRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Grocery billing backend is running' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  if (process.env.NODE_ENV === 'development') {
    const email = 'demo@gmail.com';
    const existingDemoUser = await User.findOne({ email });
    if (!existingDemoUser) {
      const passwordHash = await bcrypt.hash('Demo1234!', 12);
      await User.create({ name: 'Demo User', email, passwordHash });
      console.log('Development demo account created: demo@gmail.com');
    }
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});
