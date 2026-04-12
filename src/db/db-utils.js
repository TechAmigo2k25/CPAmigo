

export const createConnection = async (url) => {
  try {
    const mongoose = await import('mongoose');
    
    await mongoose.connect(url, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    return {
      type: 'MongoDB',
      connection: mongoose.connection
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new Error(`Database connection failed: ${errorMessage}`);
  }
};