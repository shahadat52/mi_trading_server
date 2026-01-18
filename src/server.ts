import { Server } from 'http';
import mongoose from 'mongoose';
import config from './app/config';
import app from './app';
let server: Server;


async function main() {
  try {



    await mongoose.connect(config.database as string);
    server = app.listen(config.port, () => {
      console.log(`🚀 M.I Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database', error);
  }

  if (mongoose.connection.db) {
    const stats = await mongoose.connection.db.stats();
    // console.log({
    //   data: (stats.dataSize / 1024 / 1024).toFixed(2) + " MB",
    //   index: (stats.indexSize / 1024 / 1024).toFixed(2) + " MB",
    // });
  } else {
    console.error('❌ Database connection is not established.');
  }
}
main();

process.on('unhandledRejection', () => {
  console.log('😡😡 UnhandledPromiseRejection is detected,  shuting down');
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log('😡😡 UncaughtException is detected,  shuting down');
  process.exit(1);
});
