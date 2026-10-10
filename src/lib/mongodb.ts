import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const globalForMongoose = globalThis as unknown as { mongooseCache?: MongooseCache };

const cached: MongooseCache = globalForMongoose.mongooseCache ?? {
  conn: null,
  promise: null,
};

globalForMongoose.mongooseCache = cached;

const DEFAULT_MONGODB_URI =
  "mongodb+srv://nurshop:nurshopbdnet@cluster0.1hwyova.mongodb.net/NurEngWebsite?appName=Cluster0";

/**
 * Next.js catalog site: database connection manager.
 * Connects safely with cached instance and handles reconnections if severed.
 */
export async function connectDB() {
  let MONGODB_URI = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
  if (!MONGODB_URI || MONGODB_URI.includes("glwlj6v") || !MONGODB_URI.startsWith("mongodb")) {
    MONGODB_URI = DEFAULT_MONGODB_URI;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
        minPoolSize: 1,
        maxIdleTimeMS: 60_000,
        serverSelectionTimeoutMS: 8_000,
        connectTimeoutMS: 10_000,
        family: 4,
        autoIndex: process.env.NODE_ENV !== "production",
      })
      .then((m) => {
        cached.conn = m;
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        cached.conn = null;
        throw err;
      });
  }

let indexesEnsured = false;
async function ensureIndexesOnce() {
  if (indexesEnsured) return;
  indexesEnsured = true;
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const col = mongoose.connection.collection("products");
      await Promise.all([
        col.createIndex({ published: 1, order: 1, featured: -1, createdAt: -1, _id: 1 }, { background: true }),
        col.createIndex({ category: 1, published: 1, order: 1 }, { background: true }),
        col.createIndex({ subCategory: 1, published: 1, order: 1 }, { background: true }),
        col.createIndex({ slug: 1 }, { background: true, unique: true }),
      ]);
    }
  } catch (err) {
    console.warn("MongoDB index notice:", err);
  }
}

  try {
    cached.conn = await cached.promise;
    ensureIndexesOnce().catch(() => {});
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    console.error("MongoDB connection failed:", err);
    return null;
  }
}

