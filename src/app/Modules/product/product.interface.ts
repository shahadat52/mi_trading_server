export type TProduct = {
  name: string;
  sku: string;
  lot: string;
  category?: string;
  unit: "কেজি" | "পিস" | "মণ" | "বস্তা" | "লিটার" | "বক্স" | "টন";
  purchasePrice: number;
  salesPrice: number;
  stockQty: number;
  reorderLevel: number;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
