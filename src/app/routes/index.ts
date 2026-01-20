import { Router } from 'express';
import { userRoutes } from '../Modules/User/user.route';
import { authRoutes } from '../Modules/Auth/auth.route';
import { supplierRoutes } from '../Modules/supplier/supplier.route';
import { productRouters } from '../Modules/product/product.router';
import { purchaseRouters } from '../Modules/purchase/purchase.router';
import { incomeRoutes } from '../Modules/income/income.router';
import { expenseRoutes } from '../Modules/expense/expense.router';
import { salesRouters } from '../Modules/sales/sales.router';
import { commissionSalesRoutes } from '../Modules/commissionSales/commissionSales.router';
import { deliveryRoutes } from '../Modules/delivery/delivery.router';
import { accountRoutes } from '../Modules/Account/account.route';
import { transactionRoutes } from '../Modules/transaction/transaction.route';
import { customerRouters } from '../Modules/customer/customer.router';
import { customerTxnRoutes } from '../Modules/customerTransaction/customerTxn.route';
import { commissionProductRouter } from '../Modules/commissionProduct/commissionProduct.router';
import { bepariCouthaRouters } from '../Modules/bepariCoutha/bepariCoutha.router';
import { supplierTxnRoutes } from '../Modules/supplierTxn/supplierTxn.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    router: userRoutes,
  },
  {
    path: '/auth',
    router: authRoutes,
  },
  {
    path: '/sales',
    router: salesRouters,
  },
  {
    path: '/products',
    router: productRouters,
  },
  {
    path: '/commissionProduct',
    router: commissionProductRouter,
  },
  {
    path: '/commissionSales',
    router: commissionSalesRoutes,
  },
  {
    path: '/settlement',
    router: bepariCouthaRouters,
  },
  {
    path: '/purchase',
    router: purchaseRouters,
  },
  {
    path: '/customer',
    router: customerRouters
  },
  {
    path: '/customerTxn',
    router: customerTxnRoutes
  },
  {
    path: '/suppliers',
    router: supplierRoutes,
  },
  {
    path: '/supplierTxn',
    router: supplierTxnRoutes,
  },
  {
    path: '/deliveries',
    router: deliveryRoutes,
  },
  {
    path: '/income',
    router: incomeRoutes,
  },
  {
    path: '/expense',
    router: expenseRoutes,
  },
  {
    path: '/account',
    router: accountRoutes
  },
  {
    path: '/transaction',
    router: transactionRoutes
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;
