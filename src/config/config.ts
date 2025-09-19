export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  database: {
    connectionString: process.env.MONGO_URL,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
  },
});