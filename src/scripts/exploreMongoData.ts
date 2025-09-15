#!/usr/bin/env ts-node

import { MongoDataService } from '../services/mongoDataService';

async function exploreMongoData(): Promise<void> {
  const mongoService = new MongoDataService();

  try {
    await mongoService.connect();

    console.log('=== EXPLORING MONGODB DATA ===\n');

    // Get all data to analyze
    const allData = await mongoService.fetchAllData();
    console.log(`Total documents in collection: ${allData.length}\n`);

    if (allData.length === 0) {
      console.log('No data found in collection');
      return;
    }

    // Analyze unique stations
    const uniqueStations = [...new Set(allData.map(doc => doc.uuid))];
    console.log('=== STATIONS FOUND ===');
    uniqueStations.forEach(station => {
      const stationDocs = allData.filter(doc => doc.uuid === station);
      console.log(`Station ${station}: ${stationDocs.length} readings`);

      // Show what parameters this station measures
      const parameters = new Set<string>();
      stationDocs.forEach(doc => {
        Object.keys(doc).forEach(key => {
          if (!['_id', 'uuid', 'unixtime'].includes(key)) {
            parameters.add(key);
          }
        });
      });
      console.log(`  Parameters: ${Array.from(parameters).join(', ')}`);
    });

    console.log('\n=== SAMPLE READINGS PER STATION ===');

    // Show samples for each station
    for (const station of uniqueStations.slice(0, 3)) { // Show first 3 stations
      console.log(`\n--- Station: ${station} ---`);
      const stationData = await mongoService.fetchDataByStation(station);
      mongoService.logDataSample(stationData.slice(0, 2), 2); // Show 2 samples per station
    }

    // Show time range
    const timestamps = allData.map(doc => doc.unixtime).sort((a, b) => a - b);
    if (timestamps.length > 0) {
      const earliest = timestamps[0]!;
      const latest = timestamps[timestamps.length - 1]!;
      const earliestDate = new Date(earliest * 1000);
      const latestDate = new Date(latest * 1000);

      console.log('\n=== TIME RANGE ===');
      console.log(`Earliest reading: ${earliestDate.toISOString()}`);
      console.log(`Latest reading: ${latestDate.toISOString()}`);
      console.log(`Total time span: ${Math.round((latest - earliest) / 3600)} hours`);
    }

  } catch (error) {
    console.error('Error exploring data:', error);
  } finally {
    await mongoService.disconnect();
  }
}

console.log('Starting MongoDB data exploration...\n');

exploreMongoData()
  .then(() => {
    console.log('\nData exploration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nData exploration failed:', error);
    process.exit(1);
  });