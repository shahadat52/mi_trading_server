import z from 'zod';

const createSupplierValidationSchema = z.object({
  body: z.object({
    name: z.string().nonempty('Name is required'),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    commissionPayable: z
      .number()
      .nonnegative('Previous due cannot be negative')
      .default(0)
      .optional(),
    totalPaidCommission: z
      .number()
      .nonnegative('Previous due cannot be negative')
      .default(0)
      .optional(),
  }),
});

export const supplierValidations = {
  createSupplierValidationSchema,
};
