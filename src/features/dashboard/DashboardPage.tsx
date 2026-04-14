import { Clock, Users, MapPin, User } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */

interface OrderItem {
  name: string;
  qty: number;
  amount: number;
}

interface Order {
  id: string;
  status: "preparing" | "ready" | "pending";
  location: string;
  locationType: "table" | "vip" | "takeaway";
  guests?: number;
  time: string;
  workTime: string;
  assignee: string;
  items: OrderItem[];
  isOnline?: boolean;
}

const orders: Order[] = [
  {
    id: "Order 002",
    status: "preparing",
    location: "VIP Room 08",
    locationType: "vip",
    guests: 12,
    time: "2:34",
    workTime: "08:12",
    assignee: "John doe",
    items: [
      { name: "Laster Thermidor", qty: 2, amount: 28.0 },
      { name: "Grilled Chicken", qty: 2, amount: 28.0 },
    ],
  },
  {
    id: "Order 003",
    status: "ready",
    location: "Take way",
    locationType: "takeaway",
    time: "3:34",
    workTime: "12:34",
    assignee: "John doe",
    isOnline: true,
    items: [
      { name: "Grilled Chicken", qty: 2, amount: 28.0 },
      { name: "Margherita pizza", qty: 2, amount: 28.0 },
    ],
  },
  {
    id: "Order 01",
    status: "pending",
    location: "Table 08",
    locationType: "table",
    guests: 8,
    time: "2:34",
    workTime: "12:34",
    assignee: "John doe",
    items: [
      { name: "Kaiser Salad", qty: 2, amount: 28.0 },
      { name: "Grilled Chicken", qty: 2, amount: 28.0 },
    ],
  },
];

const STATUS_CONFIG = {
  preparing: {
    label: "Preparing",
    bg: "bg-pl-100",
    text: "text-pl-700",
    ringColor: "#ff800e",
    actionLabel: "Mark Ready",
    actionClass: "bg-[#f5c518] text-[#202020] hover:bg-[#e0b416]",
  },
  ready: {
    label: "Ready",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    ringColor: "#22c55e",
    actionLabel: "Mark Complete",
    actionClass: "bg-pl-500 text-white hover:bg-pl-600",
  },
  pending: {
    label: "Pending",
    bg: "bg-pl-100",
    text: "text-pl-700",
    ringColor: "#ff800e",
    actionLabel: "Accept",
    actionClass: "border-2 border-pl-500 text-pl-600 hover:bg-pl-50",
  },
};

/* ------------------------------------------------------------------ */
/*  Circular Timer                                                    */
/* ------------------------------------------------------------------ */

const CircularTimer: React.FC<{ time: string; color: string; size?: number }> = ({
  time,
  color,
  size = 80,
}) => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // parse minutes from "MM:SS" and cap at 15 min for visual
  const [mins] = time.split(":").map(Number);
  const progress = Math.min(mins / 15, 1);
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--nl-200)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-nl-800">{time}</span>
        <span className="text-[9px] text-nl-500">Work Time</span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  KPI Cards                                                        */
/* ------------------------------------------------------------------ */

const KpiCard: React.FC<{ icon: React.ReactNode; value: number; label: string }> = ({
  icon,
  value,
  label,
}) => (
  <div className="card flex items-center gap-4 px-6 py-5">
    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-nl-100 text-nl-600">
      {icon}
    </div>
    <div>
      <span className="text-3xl font-bold text-nl-900">{value}</span>
      <p className="mt-0.5 text-xs text-nl-500">{label}</p>
    </div>
  </div>
);

const CompletionCard: React.FC<{
  completed: number;
  total: number;
}> = ({ completed, total }) => {
  const pct = Math.round((completed / total) * 100);
  return (
    <div className="card flex flex-col justify-center bg-[#fffbf0] px-6 py-5 dark:bg-[#2a2413]">
      <p className="text-xs font-semibold text-nl-700">Today Order Complete</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-nl-900">{completed}</span>
        <span className="text-lg text-nl-400">/{total}</span>
      </div>
      {/* progress bar */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-nl-200">
        <div
          className="h-full rounded-full bg-linear-to-r from-pl-400 to-pl-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-nl-400">
        <span>33%</span>
        <span>60%</span>
        <span>100%</span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Order Card                                                       */
/* ------------------------------------------------------------------ */

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const cfg = STATUS_CONFIG[order.status];
  const totalAmount = order.items.reduce((s, i) => s + i.amount * i.qty, 0);

  return (
    <div className="card flex flex-col p-5">
      {/* Header: title + badge */}
      <div className="flex items-start justify-between">
        <h4 className="text-base font-semibold text-nl-900">{order.id}</h4>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}
        >
          {cfg.label}
        </span>
      </div>

      {/* Meta row + timer */}
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-nl-600">
          <span className="flex items-center gap-1.5">
            <MapPin size={12} className="text-nl-400" />
            {order.location}
          </span>
          {order.guests !== undefined && (
            <span className="flex items-center gap-1.5">
              <Users size={12} className="text-nl-400" />
              Guests {order.guests}
            </span>
          )}
          {order.isOnline && (
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400" />
              Online Order
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock size={12} className="text-nl-400" />
            Time <strong>{order.time}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <User size={12} className="text-nl-400" />
            {order.assignee}
          </span>
        </div>
        <CircularTimer time={order.workTime} color={cfg.ringColor} />
      </div>

      {/* Items table */}
      <div className="mt-4 border-t border-nl-200 pt-3">
        <div className="mb-2 flex justify-between text-[11px] font-semibold uppercase text-nl-500">
          <span>Order Item</span>
          <span>Amount</span>
        </div>
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between py-1.5 text-sm text-nl-700">
            <div>
              <p className="font-medium text-nl-800">{item.name}</p>
              <p className="text-xs text-nl-400">Qty {item.qty}</p>
            </div>
            <span className="font-medium text-nl-800">
              ${(item.amount * item.qty).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-2 flex justify-between border-t border-nl-200 pt-3 text-sm font-bold text-nl-900">
        <span>Total Amount</span>
        <span>${totalAmount.toFixed(2)}</span>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex gap-2">
        <button
          className={`flex-1 cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${cfg.actionClass}`}
        >
          {cfg.actionLabel}
        </button>
        <button className="flex-1 cursor-pointer rounded-xl border border-nl-200 bg-white px-4 py-2.5 text-sm font-semibold text-nl-700 transition-colors hover:bg-nl-50">
          View Details
        </button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Dashboard Page                                                    */
/* ------------------------------------------------------------------ */

const DashboardPage: React.FC = () => {
  return (
    <div className="page-enter space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          }
          value={34}
          label="Total Pending Orders"
        />
        <KpiCard
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
              <path d="M9 18h6" /><path d="M10 22h4" />
            </svg>
          }
          value={20}
          label="Preparing Orders"
        />
        <KpiCard
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h6l3-9 6 18 3-9h4" />
            </svg>
          }
          value={18}
          label="Ready to serve"
        />
        <CompletionCard completed={70} total={136} />
      </div>

      {/* Active Orders Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-nl-900">Active Order</h3>
      </div>

      {/* Order Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
