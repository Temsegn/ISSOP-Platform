const { z } = require('zod');

const createRequestSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).min(5, 'Title must be at least 5 characters'),
    description: z.string({ required_error: 'Description is required' }).min(10, 'Description must be at least 10 characters'),
    category: z.string({ required_error: 'Category is required' }),
    mediaUrls: z.array(z.string()).optional(),
    latitude: z.coerce.number({ required_error: 'Latitude is required' }),
    longitude: z.coerce.number({ required_error: 'Longitude is required' }),
    address: z.string().optional(),
  }),
});

const getRequestsQuerySchema = z.object({
  query: z.object({
    status: z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED']).optional(),
    fromDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), 'Invalid date format'),
    toDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), 'Invalid date format'),
  }),
});

module.exports = {
  createRequestSchema,
  getRequestsQuerySchema,
};
