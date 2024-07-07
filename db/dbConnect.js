const { Sequelize } = require('sequelize');
const CONFIG = require('../config/config.js');

const sequelize = new Sequelize(
    CONFIG.DB_NAME,
    CONFIG.DB_USER, 
    CONFIG.DB_PASSWORD,
    {
        host: CONFIG.DB_HOST,
        dialect: CONFIG.DB_DIALECT
    }
)

// sequelize.authenticate()
//   .then(() => console.log('Connection has been established successfully.'))
//   .catch(err => console.error('Unable to connect to the database:', err));

  const createDatabase = async () => {
    const { Client } = require('pg');
    const client = new Client({
      user: CONFIG.DB_NAME,
      host: CONFIG.DB_HOST,
      password: CONFIG.DB_PASSWORD,
      port: 5432,
    });
  
    try {
      await client.connect();
      await client.query('CREATE DATABASE "database"');
      console.log('Database created successfully');
    } catch (error) {
      if (error.code !== '42P04') {
        console.error('Failed to create database', error);
        process.exit(1);
      } else {
        console.log('Database already exists');
      }
    } finally {
      await client.end();
    }
  };
  
  module.exports = { sequelize, createDatabase };

