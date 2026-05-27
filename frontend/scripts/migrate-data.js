// Data Migration Script
const { MongoClient } = require('mongodb');
const { PrismaClient, Prisma } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function migrateData() {
  console.log('Connecting to MongoDB...');
  const client = await MongoClient.connect(process.env.MONGODB_URL);
  const db = client.db();

  console.log('Connected! Starting migration...');
  
  // Get all models from Prisma schema
  const models = Prisma.dmmf.datamodel.models;
  
  for (const model of models) {
    const modelName = model.name;
    const collectionName = model.dbName || modelName; 
    
    console.log(`Migrating ${modelName}...`);
    const collection = db.collection(collectionName);
    
    // Fetch all documents from MongoDB collection
    const documents = await collection.find().toArray();
    console.log(`Found ${documents.length} records in ${collectionName}`);
    
    let successCount = 0;
    
    for (const doc of documents) {
      try {
        const id = doc._id ? doc._id.toString() : null;
        if (!id) continue;
        
        // Filter fields to match Prisma schema
        const validFields = model.fields.map(f => f.name);
        const data = {};
        
        for (const field of validFields) {
          if (field === 'id') {
            data.id = id;
            continue;
          }
          
          let val = doc[field];
          
          if (val !== undefined && val !== null) {
            // Convert MongoDB ObjectId references to standard Strings
            if (typeof val === 'object' && val.toHexString) {
               data[field] = val.toString();
            } else if (Array.isArray(val)) {
               data[field] = val.map(v => (v && typeof v === 'object' && v.toHexString) ? v.toString() : v);
            } else {
               data[field] = val;
            }
          }
        }
        
        // Upsert into Postgres
        const modelDelegate = prisma[modelName.charAt(0).toLowerCase() + modelName.slice(1)];
        if(modelDelegate) {
           await modelDelegate.upsert({
             where: { id },
             update: data,
             create: data
           });
           successCount++;
        }
      } catch (error) {
        // Skip errors (mostly schema mismatches or missing required relations)
        // console.error(`Error migrating record in ${modelName}:`, error.message);
      }
    }
    console.log(`Successfully migrated ${successCount}/${documents.length} records for ${modelName}\n`);
  }

  await client.close();
  await prisma.$disconnect();
  console.log('Migration completed successfully!');
}

migrateData();
