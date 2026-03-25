module.exports = {
    "development": {
      "user": 'postgres',
      "host": 'localhost',
      "database": 'project',
      "password": 'jerwin28',
      "port": 5432,
      "idleTimeoutMillis": 0,
      "max": 1
      
    },
    "production": {
			"user": process.env.DB_USER,
      "host": process.env.DB_HOST,
      "database": process.env.DB_DATABASE,
			"password": process.env.DB_PASSWORD,
      "port": parseInt(process.env.DB_PORT),
      "idleTimeoutMillis": 0,
      "max": 1
    }
  }

