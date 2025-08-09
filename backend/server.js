/
import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/quizzyverse', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));