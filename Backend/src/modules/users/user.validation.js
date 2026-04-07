const { z } = require('zod');

const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: z.string().optional(),
    area: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

const changeRoleSchema = z.object({
  body: z.object({
    role: z.enum(['SUPERADMIN', 'ADMIN', 'AGENT', 'USER'], { required_error: 'Role is required' }),
  }),
});

const updateLocationSchema = z.object({
  body: z.object({
    latitude: z.number({ required_error: 'Latitude is required' }),
    longitude: z.number({ required_error: 'Longitude is required' }),
  }),
});

module.exports = {
  updateUserSchema,
  changeRoleSchema,
  updateLocationSchema
};
