
import dotenv from 'dotenv';
// src/submissionqueue/submission.queue.js
import { Queue, QueueEvents } from "bullmq";
import Redis from "ioredis";
dotenv.config();




const redisConfig = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// Each gets its OWN connection — this is mandatory in BullMQ
const queueConnection      = new Redis(process.env.REDIS_HOST, redisConfig);
const queueEventsConnection = new Redis(process.env.REDIS_HOST, redisConfig);

const submissionQueue  = new Queue("submissionQueue", { connection: queueConnection });
const myqueueEvents    = new QueueEvents("submissionQueue", { connection: queueEventsConnection });

export { submissionQueue, myqueueEvents };