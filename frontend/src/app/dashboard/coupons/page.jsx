"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import useSWR from "swr";
import Container from "@/app/dashboard/_components/Container";
import DataTable from "@/app/dashboard/_components/DataTable";
import Modal from "@/app/dashboard/_components/Modal";
import ConfirmDialog from "@/app/dashboard/_components/ConfirmDialog";
import { useToastContext } from "@/app/dashboard/_components/Toaster";
import { useModel } from "@/app/dashboard/_lib/useModel";
import SearchableSelect from "@/app/dashboard/_components/SearchableSelect";
import { couponsService, freeShippingRulesService, productsService } from "@/app/dashboard/_lib/services";

const PAGE_SIZE = 20;
const TABS = [
  { id: "coupons",      label: "Coupons" },
  { id: "freeshipping", label: "Free Shipping Rules" },
];

const COUPON_TYPES = [
  { value: "PRODUCT_DISCOUNT",    label: "Product Discount" },
  { value: "MIN_PRODUCT_QUANTITY",label: "Minimum Product Quantity" },
  { value: "SHIPPING_DISCOUNT",   label: "Shipping Discount" },
  { value: "CART_TOTAL_DISCOUNT", label: "Cart Total Discount" },
  { value: "FIRST_TIME_USER",     label: "First Time User" },
  { value: "USER_SPECIFIC",       label: "User Specific" },
];

const inp = "w-full min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400";
const lbl = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

function toLocalDatetime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* ─── Product Multi-Select ───────────────────────────────────── */
function ProductMultiSelect({ selected = [], onChange }) {
  const { data: raw } = useSWR(
    "products-dropdown",
    () => productsService.list({ page_size: 200 }),
    { revalidateOnFocus: false }
  );
  const products = raw?.results || (Array.isArray(raw) ? raw : []);
  const toggle = id => onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-md max-h-44 overflow-y-auto">
      {products.length === 0 && <p className="text-xs text-gray-400 p-3">No products found.</p>}
      {products.map(p => (
        <label key={p.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
          <input
            type="checkbox"
            checked={selected.includes(p.id)}
            onChange={() => toggle(p.id)}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{p.name}</span>
          {p.sale_price && (
            <span className="text-xs text-gray-400">৳{Number(p.sale_price).toLocaleString()}</span>
          )}
        </label>
      ))}
    </div>
  );
}

/* ─── Coupon Form ────────────────────────────────────────────── */
function CouponForm({ initial = {}, onSubmit, submitLabel = "Save" }) {
  const [v, setV] = useState({
    code: "", type: "PRODUCT_DISCOUNT",
    discount_type: "PERCENT",
    discount_percent: "", discount_amount: "",
    min_quantity_required: "1", min_cart_total: "",
    usage_limit: "", active: "true", valid_from: "", expires_at: "",
    ...initial,
    active:           String(initial.active ?? true),
    discount_type:    initial.discount_type || "PERCENT",
    usage_limit:      initial.usage_limit != null ? String(initial.usage_limit) : "",
    valid_from:       toLocalDatetime(initial.valid_from),
    expires_at:       toLocalDatetime(initial.expires_at),
  });
  const [selectedProducts, setSelectedProducts] = useState(
    (initial.applicable_products || []).map(p => typeof p === "object" ? p.id : p)
  );
  const [submitting, setSubmitting] = useState(false);
  const set = (k, val) => setV(p => ({ ...p, [k]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        code:                  v.code,
        type:                  v.type,
        discount_type:         v.discount_type,
        discount_percent:      v.discount_type === "PERCENT" ? (v.discount_percent || "0") : "0",
        discount_amount:       v.discount_type === "FLAT"    ? (v.discount_amount    || "0") : "0",
        min_quantity_required: parseInt(v.min_quantity_required) || 1,
        min_cart_total:        v.min_cart_total || null,
        usage_limit:           v.usage_limit ? parseInt(v.usage_limit) : null,
        active:                v.active === "true",
        valid_from:            v.valid_from ? new Date(v.valid_from).toISOString() : null,
        expires_at:            v.expires_at ? new Date(v.expires_at).toISOString() : null,
        applicable_products:   selectedProducts,
      });
    } finally { setSubmitting(false); }
  };

  const needsProducts = ["PRODUCT_DISCOUNT", "MIN_PRODUCT_QUANTITY"].includes(v.type);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Code */}
        <div>
          <label className={lbl}>Coupon Code *</label>
          <input required className={inp + " uppercase"} value={v.code}
            onChange={e => set("code", e.target.value.toUpperCase())} placeholder="e.g., SAVE20" />
        </div>

        {/* Type */}
        <div>
          <label className={lbl}>Coupon Type *</label>
          <SearchableSelect required value={v.type} onChange={val => set("type", val)} options={COUPON_TYPES} />
        </div>

        {/* Discount type toggle */}
        <div>
          <label className={lbl}>Discount Type *</label>
          <div className="flex gap-2">
            {[["PERCENT","% Percentage"],["FLAT","৳ Flat Amount"]].map(([val, label]) => (
              <button key={val} type="button"
                onClick={() => set("discount_type", val)}
                className={`flex-1 py-2 text-sm rounded-md border transition-colors ${
                  v.discount_type === val
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white"
                    : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >{label}</button>
            ))}
          </div>
        </div>

        {/* Discount value */}
        <div>
          {v.discount_type === "PERCENT" ? (
            <>
              <label className={lbl}>Discount % *</label>
              <input required type="number" min="0" max="100" step="0.01" className={inp}
                value={v.discount_percent} onChange={e => set("discount_percent", e.target.value)} placeholder="e.g., 15" />
            </>
          ) : (
            <>
              <label className={lbl}>Flat Discount Amount (৳) *</label>
              <input required type="number" min="0" step="0.01" className={inp}
                value={v.discount_amount} onChange={e => set("discount_amount", e.target.value)} placeholder="e.g., 50" />
            </>
          )}
        </div>

        {/* Min Qty */}
        <div>
          <label className={lbl}>Min Quantity</label>
          <input type="number" min="1" className={inp} value={v.min_quantity_required}
            onChange={e => set("min_quantity_required", e.target.value)} />
        </div>

        {/* Min cart total */}
        {v.type === "CART_TOTAL_DISCOUNT" && (
          <div>
            <label className={lbl}>Min Cart Total (৳)</label>
            <input type="number" min="0" step="0.01" className={inp} value={v.min_cart_total || ""}
              onChange={e => set("min_cart_total", e.target.value)} placeholder="0.00" />
          </div>
        )}

        {/* Usage limit */}
        <div>
          <label className={lbl}>Usage Limit</label>
          <input type="number" min="1" className={inp} value={v.usage_limit}
            onChange={e => set("usage_limit", e.target.value)} placeholder="Unlimited" />
        </div>

        {/* Status */}
        <div>
          <label className={lbl}>Status</label>
          <SearchableSelect value={v.active} onChange={val => set("active", val)} options={[
            { value: "true",  label: "Active" },
            { value: "false", label: "Inactive" },
          ]} />
        </div>

        {/* Valid from / Expires */}
        <div>
          <label className={lbl}>Valid From *</label>
          <input required type="datetime-local" className={inp} value={v.valid_from}
            onChange={e => set("valid_from", e.target.value)} />
        </div>
        <div>
          <label className={lbl}>Expires At *</label>
          <input required type="datetime-local" className={inp} value={v.expires_at}
            onChange={e => set("expires_at", e.target.value)} />
        </div>
      </div>

      {/* Product select — only for product-related types */}
      {needsProducts && (
        <div>
          <label className={lbl}>
            Applicable Products
            <span className="ml-1 text-xs text-gray-400 font-normal">(leave empty = all products)</span>
          </label>
          <ProductMultiSelect selected={selectedProducts} onChange={setSelectedProducts} />
          {selectedProducts.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">{selectedProducts.length} product(s) selected</p>
          )}
        </div>
      )}

      <div className="flex justify-end pt-1">
        <button type="submit" disabled={submitting}
          className="px-4 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50">
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

/* ─── Free Shipping Rule Form ────────────────────────────────── */
function FreeShippingForm({ initial = {}, onSubmit, submitLabel = "Save" }) {
  const [name,      setName]      = useState(initial.name || "");
  const [threshold, setThreshold] = useState(initial.threshold_amount || "");
  const [active,    setActive]    = useState(String(initial.active ?? true));
  const [selectedProducts, setSelectedProducts] = useState(
    (initial.applicable_products || []).map(p => typeof p === "object" ? p.id : p)
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        name,
        threshold_amount:    threshold,
        active:              active === "true",
        applicable_products: selectedProducts,
      });
    } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Rule Name</label>
          <input className={inp} value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g., Free shipping over ৳500" />
        </div>
        <div>
          <label className={lbl}>Threshold Amount (৳) *</label>
          <input required type="number" min="0" step="0.01" className={inp} value={threshold}
            onChange={e => setThreshold(e.target.value)} placeholder="e.g., 500" />
        </div>
        <div>
          <label className={lbl}>Status</label>
          <SearchableSelect value={active} onChange={setActive} options={[
            { value: "true",  label: "Active" },
            { value: "false", label: "Inactive" },
          ]} />
        </div>
      </div>

      {/* Applicable Products */}
      <div>
        <label className={lbl}>
          Applicable Products
          <span className="ml-1 text-xs text-gray-400 font-normal">(leave empty = all products)</span>
        </label>
        <ProductMultiSelect selected={selectedProducts} onChange={setSelectedProducts} />
        {selectedProducts.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">{selectedProducts.length} product(s) selected</p>
        )}
      </div>

      <div className="flex justify-end pt-1">
        <button type="submit" disabled={submitting}
          className="px-4 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50">
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function CouponsPage() {
  const toast = useToastContext();
  const [tab,     setTab]     = useState("coupons");
  const [modal,   setModal]   = useState({ open: false, mode: "create", item: null });
  const [confirm, setConfirm] = useState({ open: false, item: null, tab: null });

  const coupons = useModel(couponsService, {
    defaultParams: { page_size: PAGE_SIZE, page: 1 },
    paginated: true,
    onSuccess: (m) => { toast.success(m); setModal({ open: false, mode: "create", item: null }); },
    onError:   (e) => toast.error(e?.message || "Operation failed"),
  });

  const freeShipping = useModel(freeShippingRulesService, {
    defaultParams: { page_size: PAGE_SIZE, page: 1 },
    paginated: true,
    onSuccess: (m) => { toast.success(m); setModal({ open: false, mode: "create", item: null }); },
    onError:   (e) => toast.error(e?.message || "Operation failed"),
  });

  const formatDate = d => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  const couponColumns = [
    { key: "code", label: "Code", render: v => <code className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{v}</code> },
    { key: "type_display", label: "Type" },
    { key: "discount_type", label: "Disc. Type", render: v => (
      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${v === "FLAT" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"}`}>
        {v === "FLAT" ? "Flat ৳" : "% Off"}
      </span>
    )},
    { key: "discount_percent", label: "Value", render: (v, row) =>
        row.discount_type === "FLAT"
          ? <span className="font-medium text-green-600 dark:text-green-400">৳{Number(row.discount_amount || 0).toLocaleString()}</span>
          : <span className="font-medium text-green-600 dark:text-green-400">{v}%</span>
    },
    { key: "usage_limit", label: "Usage", render: (v, row) =>
        v != null ? <span className="text-xs">{row.used_count}/{v}</span>
                  : <span className="text-xs text-gray-400">Unlimited</span>
    },
    { key: "applicable_products_data", label: "Products", render: v =>
        Array.isArray(v) && v.length > 0
          ? <span className="text-xs text-gray-600 dark:text-gray-400">{v.length} product(s)</span>
          : <span className="text-xs text-gray-400">All</span>
    },
    { key: "active", label: "Status", render: v => (
      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${v ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
        {v ? "Active" : "Inactive"}
      </span>
    )},
    { key: "is_expired", label: "Validity", render: v =>
        v ? <span className="text-xs text-red-500 font-medium">Expired</span>
          : <span className="text-xs text-green-600">Valid</span>
    },
    { key: "valid_from",  label: "From",    render: formatDate },
    { key: "expires_at",  label: "Expires", render: formatDate },
  ];

  const freeShippingColumns = [
    { key: "name", label: "Name", render: v => v || <span className="text-gray-400 text-xs">Unnamed</span> },
    { key: "threshold_amount", label: "Threshold (৳)", render: v => <span className="font-medium">৳{parseFloat(v).toLocaleString()}</span> },
    { key: "applicable_products", label: "Products", render: v =>
        Array.isArray(v) && v.length > 0
          ? <span className="text-xs">{v.length} product(s)</span>
          : <span className="text-xs text-gray-400">All products</span>
    },
    { key: "active", label: "Status", render: v => (
      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${v ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
        {v ? "Active" : "Inactive"}
      </span>
    )},
    { key: "created_at", label: "Created", render: formatDate },
  ];

  const getModel   = () => tab === "coupons" ? coupons : freeShipping;
  const getColumns = () => tab === "coupons" ? couponColumns : freeShippingColumns;
  const getLabel   = () => tab === "coupons" ? "Coupon" : "Free Shipping Rule";

  const handleSave = async (data) => {
    const model = getModel();
    if (modal.mode === "edit") await model.update(modal.item.id, data);
    else await model.create(data);
  };

  const handleDelete = async () => {
    try {
      const model = confirm.tab === "coupons" ? coupons : freeShipping;
      await model.remove(confirm.item.id);
      setConfirm({ open: false, item: null, tab: null });
    } catch (e) { toast.error(e?.message || "Delete failed"); }
  };

  const actions = row => (
    <div className="flex items-center gap-1">
      <button onClick={() => setModal({ open: true, mode: "edit", item: row })}
        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => setConfirm({ open: true, item: row, tab })}
        className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-500 hover:text-red-600 dark:hover:text-red-400">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <Container title="Coupons & Promotions" description="Manage discount coupons and free shipping rules">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 p-0.5 rounded-lg">
          {TABS.map(t => (
            <button key={t.id}
              onClick={() => { setTab(t.id); setModal({ open: false, mode: "create", item: null }); setConfirm({ open: false, item: null, tab: null }); }}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${tab === t.id ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm font-medium" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={() => setModal({ open: true, mode: "create", item: null })}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 whitespace-nowrap">
          <Plus className="w-3.5 h-3.5" /> Add {getLabel()}
        </button>
      </div>

      <DataTable
        key={tab}
        columns={getColumns()}
        data={getModel().data}
        loading={getModel().loading}
        actions={actions}
        serverSide
        totalItems={getModel().totalCount}
        currentPage={getModel().params.page || 1}
        pageSize={PAGE_SIZE}
        searchable
        searchValue={getModel().params.search || ""}
        onSearch={q => { getModel().setSearch(q); getModel().setPage(1); }}
        onPageChange={getModel().setPage}
        emptyMessage={`No ${tab === "coupons" ? "coupons" : "free shipping rules"} found`}
      />

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, mode: "create", item: null })}
        title={`${modal.mode === "edit" ? "Edit" : "Add"} ${getLabel()}`}
        maxWidth="max-w-2xl"
      >
        {tab === "coupons" ? (
          <CouponForm
            initial={modal.mode === "edit" ? modal.item : {}}
            onSubmit={handleSave}
            submitLabel={modal.mode === "edit" ? "Update" : "Create"}
          />
        ) : (
          <FreeShippingForm
            initial={modal.mode === "edit" ? modal.item : {}}
            onSubmit={handleSave}
            submitLabel={modal.mode === "edit" ? "Update" : "Create"}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, item: null, tab: null })}
        onConfirm={handleDelete}
        title={`Delete ${getLabel()}`}
        message={`Are you sure you want to delete ${confirm.tab === "coupons" ? `"${confirm.item?.code}"` : "this rule"}? This cannot be undone.`}
      />
    </Container>
  );
}