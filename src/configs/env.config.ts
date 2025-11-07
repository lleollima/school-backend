export const envConfig = () => ({
  application: {
    name: process.env.APP_NAME || 'MyApp',
    version: process.env.APP_VERSION || '1.0.0',
      port: process.env.APP_PORT || 8080
  },
    database: {
      url: process.env.DATABASE_URL,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expires_in: process.env.JWT_EXPIRES_IN || '1h'
    }
})