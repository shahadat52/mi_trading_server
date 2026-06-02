import { Router } from 'express';
import { userRoutes } from '../Modules/User/user.route';
import { authRoutes } from '../Modules/Auth/auth.route';
import { supplierRoutes } from '../Modules/supplier/supplier.route';
import { productRouters } from '../Modules/product/product.router';
import { purchaseRouters } from '../Modules/purchase/purchase.router';
import { salesRouters } from '../Modules/sales/sales.router';
import { commissionSalesRoutes } from '../Modules/commissionSales/commissionSales.router';
import { deliveryRoutes } from '../Modules/delivery/delivery.router';
import { accountRoutes } from '../Modules/Account/account.route';
import { customerRouters } from '../Modules/customer/customer.router';
import { customerTxnRoutes } from '../Modules/customerTransaction/customerTxn.route';
import { commissionProductRouter } from '../Modules/commissionProduct/commissionProduct.router';
import { bepariCouthaRouters } from '../Modules/bepariCoutha/bepariCoutha.router';
import { supplierTxnRoutes } from '../Modules/supplierTxn/supplierTxn.route';
import { bothSalesRouters } from '../Modules/bothSales/bothSales.router';
import { brokerRoutes } from '../Modules/Broker/broker.router';
import { brokerTxnRoutes } from '../Modules/BrokerTxn/brokerTxn.router';
import { cashboxRoutes } from '../Modules/cashbox/cashbox.router';
import { bankTransactionRoutes } from '../Modules/bankTransaction/transaction.route';
import { transactionRoutes } from '../Modules/incomeExpanseTxn/transaction.route';
import { attendanceRoutes } from '../Modules/Attendance/attendance.route';
import { sectorRoutes } from '../Modules/incomeExpenseSector/sector.route';
import { employeeRoutes } from '../Modules/employee/employee.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    router: userRoutes,
  },
  {
    path: '/employee',
    router: employeeRoutes,
  },
  {
    path: '/auth',
    router: authRoutes,
  },
  {
    path: '/bothSales',
    router: bothSalesRouters
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
    path: '/account',
    router: accountRoutes
  },
  {
    path: '/bankTxn',
    router: bankTransactionRoutes
  },
  {
    path: '/txn',
    router: transactionRoutes
  },
  {
    path: '/broker',
    router: brokerRoutes
  },
  {
    path: '/brokerTxn',
    router: brokerTxnRoutes
  },
  {
    path: '/cashbox',
    router: cashboxRoutes
  },
  {
    path: '/attendance',
    router: attendanceRoutes
  },
  {
    path: '/sector',
    router: sectorRoutes
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;
