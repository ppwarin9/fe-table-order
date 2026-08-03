// interface ApiClient - every operation this frontend performs against the real backend.
import type { ID, Satang } from '@/lib/types/common';
import type {
  MenuCategory,
  MenuItem,
  MenuItemDetail,
  CartDetail,
  OrderRoundDetail,
  OrderItemStatus,
  BillDetail,
  SplitMethod,
  DiningTable,
  PaymentMethodCode,
  PaymentStatus,
  Role,
  StaffUser,
  StoreSetting,
} from '@/lib/types';

// ---- session ----
export interface JoinTableResult {
  tableSessionId: ID;
  memberId: ID;
  sessionToken: string;
  tableNumber: string;
  member: { id: ID; displayName: string; pictureUrl: string };
}

export interface SessionInfo {
  id: ID;
  status: 'open' | 'closed';
  tableNumber: string;
  openedAt: string;
}

export interface SessionMemberView {
  id: ID;
  displayName: string;
  pictureUrl: string;
  joinedAt: string;
}

// ---- cart ----
// No modifierOptionIds field — the backend has no such concept.
export interface AddCartItemInput {
  menuItemId: ID;
  quantity: number;
  note?: string;
}

// ---- bill ----
// Payment records themselves are real (POST creates a real PENDING row, PATCH .../notify
// really marks it NOTIFIED) — there's just no real money movement/gateway behind them yet.
export interface PaymentView {
  id: ID;
  billShareId: ID;
  method: PaymentMethodCode;
  amount: Satang;
  status: PaymentStatus;
}

// ---- admin ----
export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  staff: StaffUser;
}

// ---- admin: staff & roles ----
export interface CreateStaffUserInput {
  email: string;
  password: string;
  name: string;
  roleId: ID;
}

export interface SalesReportItem {
  menuItemId: ID;
  name: string;
  quantitySold: number;
  revenue: number;
}

export interface SalesReport {
  date: string;
  totalRevenue: number;
  totalOrders: number;
  orderCount: number;
  topItems: SalesReportItem[];
}

export interface ActiveSessionView {
  sessionId: ID;
  tableId: ID;
  tableNumber: string;
  openedAt: string;
  memberCount: number;
  pendingItemCount: number;
}

// Flat, matching the real admin/order-items response exactly — no round-level grouping,
// no modifiers, no addedBy/addedByName.
export interface AdminOrderItemView {
  id: ID;
  tableSessionId: ID;
  tableNumber: string;
  roundNumber: number;
  submittedAt: string;
  quantity: number;
  nameSnapshot: string;
  note: string;
  status: OrderItemStatus;
  startedAt: string | null;
  estimatedMinutes: number;
}

// Real bill-detail view for the admin billing page, backed by
// GET /admin/table-sessions/:id/bill. A share's PromptPay payment can't be confirmed
// from this view yet — confirming needs a paymentId, and this endpoint only exposes
// billShareId; cash settlement works today via billShareId directly.
export interface AdminBillShareView {
  id: ID;
  label: string;
  amountDue: Satang;
  status: 'unpaid' | 'paid';
  method: PaymentMethodCode | null;
}

export interface AdminBillView {
  tableSessionId: ID;
  subtotal: Satang;
  serviceChargeAmount: Satang;
  vatAmount: Satang;
  grandTotal: Satang;
  status: 'open' | 'settled';
  shares: AdminBillShareView[];
}

export interface ApiClient {
  // session
  joinTable(qrToken: string): Promise<JoinTableResult>;
  getSession(sessionId: ID): Promise<SessionInfo>;
  getMembers(sessionId: ID): Promise<SessionMemberView[]>;

  // menu
  getCategories(): Promise<MenuCategory[]>;
  getMenuItems(categoryId?: ID): Promise<MenuItem[]>;
  getMenuItem(menuItemId: ID): Promise<MenuItemDetail>;

  // cart
  getCart(sessionId: ID): Promise<CartDetail>;
  addItem(sessionId: ID, memberId: ID, input: AddCartItemInput): Promise<CartDetail>;
  updateQty(sessionId: ID, cartItemId: ID, quantity: number): Promise<CartDetail>;
  removeItem(sessionId: ID, cartItemId: ID): Promise<CartDetail>;

  // order
  submitRound(sessionId: ID): Promise<OrderRoundDetail>;
  getRounds(sessionId: ID): Promise<OrderRoundDetail[]>;
  updateItemStatus(orderItemId: ID, status: OrderItemStatus): Promise<void>;

  // bill
  // splitMethod must be chosen before issuing — no endpoint to change it afterward.
  issueBill(sessionId: ID, splitMethod: SplitMethod, payerId?: ID): Promise<BillDetail>;
  getBill(sessionId: ID): Promise<BillDetail | null>;
  createPayment(billShareId: ID, method: PaymentMethodCode): Promise<PaymentView>;
  notifyPayment(paymentId: ID): Promise<void>;

  // admin: auth
  login(input: LoginInput): Promise<LoginResult>;

  // admin: staff & roles (SUPERADMIN only)
  getStaffUsers(): Promise<StaffUser[]>;
  getStaffUser(staffId: ID): Promise<StaffUser>;
  createStaffUser(input: CreateStaffUserInput): Promise<StaffUser>;
  updateStaffUser(staffId: ID, input: Partial<Omit<StaffUser, 'id'>>): Promise<StaffUser>;
  deleteStaffUser(staffId: ID): Promise<StaffUser>;
  getRoles(): Promise<Role[]>;
  updateRole(roleId: ID, name: string): Promise<Role>;

  // admin: tables
  getTables(): Promise<DiningTable[]>;
  createTable(tableNumber: string): Promise<DiningTable>;
  updateTable(tableId: ID, input: Partial<Omit<DiningTable, 'id'>>): Promise<DiningTable>;
  regenerateQr(tableId: ID): Promise<DiningTable>;
  deleteTable(tableId: ID): Promise<void>;

  // admin: menu
  // storeId is never client-supplied — the backend is single-store and infers/manages
  // it server-side (no such field on CreateMenuCategoryDto/CreateMenuItemDto).
  getCategoriesAdmin(): Promise<MenuCategory[]>;
  createCategory(input: Omit<MenuCategory, 'id' | 'isActive' | 'storeId'>): Promise<MenuCategory>;
  updateCategory(categoryId: ID, input: Partial<Omit<MenuCategory, 'id'>>): Promise<MenuCategory>;
  deleteCategory(categoryId: ID): Promise<void>;
  getMenuItemsAdmin(): Promise<MenuItem[]>;
  getMenuItemAdmin(menuItemId: ID): Promise<MenuItem>;
  createMenuItem(input: Omit<MenuItem, 'id' | 'isAvailable' | 'storeId'>): Promise<MenuItem>;
  updateMenuItem(menuItemId: ID, input: Partial<Omit<MenuItem, 'id'>>): Promise<MenuItem>;
  deleteMenuItem(menuItemId: ID): Promise<void>;

  // admin: settings
  getSettings(): Promise<StoreSetting>;
  updateSettings(input: Partial<StoreSetting>): Promise<StoreSetting>;

  // admin: report
  getReport(date: string): Promise<SalesReport>;

  // admin: live views
  getActiveSessions(): Promise<ActiveSessionView[]>;
  getOrderQueue(status?: OrderItemStatus): Promise<AdminOrderItemView[]>;

  // admin: billing detail
  getAdminBillDetail(sessionId: ID): Promise<AdminBillView>;
  settleAdminBillShare(sessionId: ID, shareId: ID, method: PaymentMethodCode): Promise<AdminBillView>;

  // admin: closing
  closeSession(sessionId: ID): Promise<void>;
}
