import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB 연결 성공: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB 연결 실패: ${error.message}`);
    console.log('⚠️  MongoDB 없이 계속 진행합니다. 일부 기능이 제한될 수 있습니다.');
    // MongoDB 없이도 서버는 계속 실행
  }
};

export default connectDB;


