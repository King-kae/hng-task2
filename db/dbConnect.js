const { Sequelize } = require('sequelize');
const { PostgresDialect } = require('@sequelize/postgres')
const CONFIG = require('../config/config.js');
require('dotenv').config();

const sequelize = new Sequelize(
  {
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dialect: PostgresDialect
  }
)

// sequelize.authenticate()
//   .then(() => console.log('Connection has been established successfully.'))
//   .catch(err => console.error('Unable to connect to the database:', err));

const createDatabase = async () => {
  const { Client } = require('pg');
  const client = new Client({
    user: process.env.DB_NAME,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
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

