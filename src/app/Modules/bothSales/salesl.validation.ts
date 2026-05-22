import { z } from 'zod';

// Zod schema for individual product in the sale
const salesProductSchema = z.object({
  product: z.string().nonempty({ message: 'Product ID is required' }),
  qty: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  total: z.number().min(0, 'Total must be positive'),
});

// Main Sale validation schema
export const saleValidationSchema = z.object({
  customer: z.string().nonempty({ message: 'Customer name is required' }),
  phone: z.string().nonempty({ message: 'Customer phone number is required' }),
  salesDate: z.coerce.date().optional(), // coerce converts strings like "2025-11-13" to Date
  invoice: z.string().optional(),
  arot: z.number().min(0).default(0),
  brokary: z.number().min(0).default(0),
  cash_transport: z.number().min(0).default(0),
  godi: z.number().min(0).default(0),
  haolat: z.number().min(0).default(0),
  kuli: z.number().min(0).default(0),
  tohori: z.number().min(0).default(0),
  truck_rent: z.number().min(0).default(0),

  salesProducts: z
    .array(salesProductSchema)
    .nonempty({ message: 'At least one product is required' }),

  subTotal: z.number().optional(),
  discount: z.number().min(0).default(0),
  broker: z.string().optional().default(''),
  grandTotal: z.number().optional(),
  paidAmount: z.number().min(0).default(0),
  dueAmount: z.number().optional(),
  isPaid: z.boolean().default(false),
  paymentMethod: z.enum(['cash', 'bank', 'mobile']).default('cash'),
});

export type SaleInput = z.infer<typeof saleValidationSchema>;
