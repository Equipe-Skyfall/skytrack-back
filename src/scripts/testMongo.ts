#!/usr/bin/env ts-node

import { testMongoConnection } from '../services/mongoDataService';

console.log('Starting MongoDB connection test...\n');

testMongoConnection()
  .then(() => {
    console.log('\nMongoDB test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMongoDB test failed:', error);
    process.exit(1);
  });