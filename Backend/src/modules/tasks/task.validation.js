const { z } = require('zod');

const completeTaskSchema = z.object({
  body: z.object({
    completionProofUrl: z.string({ required_error: 'Completion proof URL is required' }).url('Invalid string format. Must be a valid URL.'),
  }),
});

module.exports = {
  completeTaskSchema
};
