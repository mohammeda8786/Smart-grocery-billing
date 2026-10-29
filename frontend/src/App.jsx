import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL?.trim();
const normalizedApiUrl = rawApiUrl
  ? rawApiUrl.replace(/\/$/, '').replace(/\/api$/, '')
  : null;
const api = axios.create({
  baseURL: normalizedApiUrl ? `${normalizedApiUrl}/api` : '/api',
  timeout: 8000,
});

const authTokenKey = 'groceryBillingToken';

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(authTokenKey);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const initialProductState = {
  name: '',
  ratePerKg: 0,
  ratePerPadi: 0,
};

function formatCurrency(value) {
  return `₹${value.toFixed(2)}`;
}

function clampNumber(value, minimum = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= minimum ? parsed : minimum;
}

function getTamilUnit(unit) {
  if (unit === 'KG') return 'கிலோ';
  if (unit === 'PADI') return 'படி';
  return unit;
}

function AuthPage({ onAuthenticated, initialError = '' }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(initialError);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const isRegistering = mode === 'register';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post(`/auth/${mode}`, {
        ...(isRegistering ? { name: name.trim() } : {}),
        email: email.trim(),
        password,
      });
      if (isRegistering) {
        setMode('login');
        setPassword('');
        setSuccess('Account created successfully. Sign in with your email and password.');
      } else {
        onAuthenticated(response.data);
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Unable to authenticate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const changeMode = () => {
    setMode(isRegistering ? 'login' : 'register');
    setError('');
    setSuccess('');
  };

  const fillDemoCredentials = () => {
    setEmail('demo@gmail.com');
    setPassword('Demo1234!');
    setError('');
    setSuccess('');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-sky-600">Weekly Market Billing</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
          {isRegistering ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {isRegistering ? 'Register to start managing your grocery bills.' : 'Sign in to continue to your billing dashboard.'}
        </p>

        {error && (
          <div role="alert" className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        {success && (
          <div role="status" className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {!isRegistering && import.meta.env.DEV && (
          <div className="mt-5 rounded-2xl bg-sky-50 p-4 text-sm text-sky-900">
            <p className="font-semibold">Demo account (development only)</p>
            <p className="mt-1">Email: demo@gmail.com</p>
            <p>Password: Demo1234!</p>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="mt-3 rounded-xl bg-sky-600 px-3 py-2 font-semibold text-white hover:bg-sky-700"
            >
              Use demo account
            </button>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {isRegistering && (
            <label className="block text-sm font-medium text-slate-700">
              Name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                maxLength={80}
                required
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              />
            </label>
          )}
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setSuccess('');
              }}
              autoComplete="email"
              required
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              minLength={8}
              required
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            />
            {isRegistering && <span className="mt-1 block text-xs text-slate-500">Use at least 8 characters.</span>}
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-sky-600 px-4 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Please wait…' : isRegistering ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {isRegistering ? 'Already have an account?' : 'New to the billing app?'}{' '}
          <button type="button" onClick={changeMode} className="font-semibold text-sky-700 hover:text-sky-800">
            {isRegistering ? 'Sign in' : 'Register'}
          </button>
        </p>
      </section>
    </main>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedWeightType, setSelectedWeightType] = useState('KG');
  const [selectedRate, setSelectedRate] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('1');
  const [productSearch, setProductSearch] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem(authTokenKey));
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    let active = true;

    if (!token) {
      setUser(null);
      setAuthLoading(false);
      return () => {
        active = false;
      };
    }

    api.get('/auth/me')
      .then((response) => {
        if (active) setUser(response.data);
      })
      .catch((err) => {
        if (!active) return;
        if (err?.response?.status === 401) {
          localStorage.removeItem(authTokenKey);
          setToken(null);
          setAuthError('Your session expired. Please sign in again.');
        } else {
          console.error(err);
          setAuthError('Unable to verify your session. Check your connection and try again.');
        }
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    const search = productSearch.trim();
    if (!user || !search) {
      setProducts([]);
      setProductLoading(false);
      return undefined;
    }

    setProducts([]);
    setProductLoading(true);
    setError('');
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const response = await api.get('/products', {
          params: { search },
          signal: controller.signal,
        });
        setProducts(response.data);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error(err);
        setError(err?.response?.data?.message || 'Unable to search products.');
      } finally {
        if (!controller.signal.aborted) setProductLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [productSearch, user]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.total, 0), [cart]);
  const totalAmount = Math.max(0, subtotal - discount);

  const handleAuthenticated = ({ token: nextToken, user: nextUser }) => {
    localStorage.setItem(authTokenKey, nextToken);
    setAuthError('');
    setToken(nextToken);
    setUser(nextUser);
  };

  const handleLogout = () => {
    localStorage.removeItem(authTokenKey);
    setToken(null);
    setUser(null);
    setProducts([]);
    setCart([]);
    setProductSearch('');
    setStatus('');
    setError('');
  };

  const addToCart = (product, weightType = 'KG', customRate, quantity = 1) => {
    setError('');
    setCart((previous) => {
      const exists = previous.some(
        (item) => item.name === product.name && item.weightType === weightType
      );
      if (exists) {
        return previous;
      }

      const rate = customRate ?? (weightType === 'PADI' ? product.ratePerPadi : product.ratePerKg);
      const newItem = {
        id: `${product._id}-${weightType}-${Date.now()}`,
        productId: product._id,
        name: product.name,
        tamilName: product.tamilName || product.name,
        weightType,
        rate,
        quantity,
        ratePerKg: product.ratePerKg,
        ratePerPadi: product.ratePerPadi,
        total: rate * quantity,
      };

      return [...previous, newItem];
    });
  };

  const handleProductClick = (product) => {
    const matchingItems = cart.filter((item) => item.name === product.name);
    const hasKG = matchingItems.some((item) => item.weightType === 'KG');
    const hasPADI = matchingItems.some((item) => item.weightType === 'PADI');

    if (matchingItems.length === 0) {
      setSelectedProduct(product);
      setSelectedWeightType('KG');
      setSelectedRate(String(product.ratePerKg));
      setSelectedQuantity('1');
      return;
    }

    if (matchingItems.length === 1) {
      if (!hasKG) {
        addToCart(product, 'KG');
        return;
      }
      if (!hasPADI) {
        addToCart(product, 'PADI');
        return;
      }
    }

    window.alert('Item already exists in bill');
    setError('Item already exists in bill');
  };

  const confirmWeightSelection = () => {
    if (!selectedProduct) return;
    const rate = Number(selectedRate);
    if (!Number.isFinite(rate) || rate < 0) {
      setError('Enter a valid product price.');
      return;
    }

    const quantity = Number(selectedQuantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      setError('Enter a valid quantity of at least 1.');
      return;
    }

    addToCart(selectedProduct, selectedWeightType, rate, quantity);
    setSelectedProduct(null);
    setSelectedRate('');
    setSelectedQuantity('1');
  };

  const closeWeightSelection = () => {
    setSelectedProduct(null);
    setSelectedRate('');
    setSelectedQuantity('1');
  };

  const updateQuantity = (index, value) => {
    setCart((previous) => {
      const updated = [...previous];
      const item = { ...updated[index] };
      item.quantity = Math.max(1, Math.floor(clampNumber(value)));
      item.total = clampNumber(item.rate * item.quantity);
      updated[index] = item;
      return updated;
    });
  };

  const updateRate = (index, value) => {
    setCart((previous) => {
      const updated = [...previous];
      const item = { ...updated[index] };
      item.rate = clampNumber(value);
      item.total = clampNumber(item.rate * item.quantity);
      updated[index] = item;
      return updated;
    });
  };

  const updateWeightType = (index, value) => {
    setCart((previous) => {
      const updated = [...previous];
      const item = { ...updated[index] };
      const newRate = value === 'PADI' ? item.ratePerPadi : item.ratePerKg;
      item.weightType = value;
      item.rate = newRate;
      item.total = clampNumber(item.rate * item.quantity);
      updated[index] = item;
      return updated;
    });
  };

  const removeItem = (id) => {
    setCart((previous) => previous.filter((item) => item.id !== id));
  };

  const clearStatus = () => {
    setStatus('');
    setError('');
  };

  const validatePhone = (value) => /^[0-9]{10}$/.test(value);

  const handleSendBill = async () => {
    clearStatus();

    if (cart.length === 0) {
      setError('Add at least one bill item before sending.');
      return;
    }

    if (!customerName.trim()) {
      setError('Enter customer name.');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Enter a valid 10-digit phone number.');
      return;
    }

    const whatsappWindow = window.open('', '_blank');
    if (!whatsappWindow) {
      setError('Unable to open WhatsApp. Please allow popups and try again.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        phone,
        customerName: customerName.trim(),
        items: cart.map(({ name, tamilName, rate, quantity, weightType, total }) => ({
          name,
          tamilName,
          rate,
          quantity,
          weightType,
          total,
        })),
        totalAmount,
      };

      const response = await api.post('/send-bill', payload);
      const whatsappLink = response.data.whatsappLink;
      setStatus('Bill ready. Opening WhatsApp...');
      whatsappWindow.location.href = whatsappLink;
    } catch (err) {
      console.error(err);
      if (whatsappWindow && !whatsappWindow.closed) whatsappWindow.close();
      setError(err?.response?.data?.message || err.message || 'Unable to send bill.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintBill = () => {
    clearStatus();
    if (cart.length === 0) {
      setError('Add at least one bill item before printing.');
      return;
    }

    window.print();
  };

  const setQuickDiscount = (value) => {
    setDiscount((prev) => {
      const next = prev === value ? 0 : value;
      return Math.min(Math.max(next, 0), subtotal);
    });
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-500">
        Verifying your account…
      </main>
    );
  }

  if (!user) {
    return <AuthPage onAuthenticated={handleAuthenticated} initialError={authError} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-20 rounded-3xl border border-slate-200 bg-white/95 px-4 py-4 shadow-soft backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-sky-600">Weekly Market Billing</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">Grocery / Pulses Shop</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm font-medium text-slate-600 sm:inline">{user.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Sign out
              </button>
            </div>
          </div>


          {error && (
            <div className="mt-4 rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">{error}</div>
          )}
          {status && (
            <div className="mt-4 rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">{status}</div>
          )}
        </header>

        <main className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <section className="space-y-5">
            <div className="rounded-3xl bg-white p-4 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Products</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                  {products.length} results
                </span>
              </div>

              <label className="mb-4 block text-sm font-medium text-slate-700">
                Search products
                <input
                  type="search"
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder="Search in English or Tamil"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </label>

              {productLoading ? (
                <div className="rounded-3xl bg-slate-50 p-10 text-center text-slate-500">Searching products…</div>
              ) : !productSearch.trim() ? (
                <div className="rounded-3xl bg-slate-50 p-10 text-center text-slate-500">
                  Search by English or Tamil product name to find items.
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 p-10 text-center text-slate-500">No matching products found.</div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {products.map((product) => (
                    <div
                      key={product._id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleProductClick(product)}
                      className="flex cursor-pointer flex-col items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center shadow-sm transition hover:border-sky-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    >
                      <div>
                        <p className="text-lg font-semibold">{product.tamilName || product.name}</p>
                        {product.tamilName && product.name !== product.tamilName && (
                          <p className="mt-2 text-sm text-slate-500">{product.name}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleProductClick(product);
                        }}
                        className="mt-4 w-full rounded-3xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-4 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Billing Cart</h2>
                <span className="text-sm text-slate-500">Editable prices & units</span>
              </div>

              {cart.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 p-10 text-center text-slate-500">Add items to the cart to start billing.</div>
              ) : (
                <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                  <table className="min-w-full border-collapse text-center text-sm">
                    <thead>
                      <tr className="border-b border-slate-300 text-base font-semibold">
                        <th className="px-3 py-3">பொருள்</th>
                        <th className="px-3 py-3">அளவு</th>
                        <th className="px-3 py-3">அளவீடு</th>
                        <th className="px-3 py-3">விலை</th>
                        <th className="px-3 py-3">மொத்தம்</th>
                        <th className="px-3 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item, index) => (
                        <tr key={item.id} className="border-b border-slate-200">
                          <td className="px-3 py-4 text-left align-middle text-base font-medium text-slate-800">
                            {item.tamilName || item.name}
                          </td>
                          <td className="px-3 py-4 align-middle">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(index, e.target.value)}
                              className="mx-auto w-20 rounded-3xl border border-slate-300 bg-white px-3 py-2 text-center text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                            />
                          </td>
                          <td className="px-3 py-4 align-middle">
                            <select
                              value={item.weightType}
                              onChange={(e) => updateWeightType(index, e.target.value)}
                              className="mx-auto w-24 rounded-3xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                            >
                              <option value="KG">{getTamilUnit('KG')}</option>
                              <option value="PADI">{getTamilUnit('PADI')}</option>
                            </select>
                          </td>
                          <td className="px-3 py-4 align-middle">
                            <input
                              type="number"
                              min="0"
                              value={item.rate}
                              onChange={(e) => updateRate(index, e.target.value)}
                              className="mx-auto w-24 rounded-3xl border border-slate-300 bg-white px-3 py-2 text-center text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                            />
                          </td>
                          <td className="px-3 py-4 align-middle font-semibold text-slate-700">
                            {formatCurrency(item.total)}
                          </td>
                          <td className="px-3 py-4 align-middle">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="rounded-3xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-4 flex flex-col gap-2 rounded-3xl bg-slate-100 px-4 py-4 text-right text-base font-semibold text-slate-800 sm:flex-row sm:justify-between sm:text-left">
                    <span className="text-sm text-slate-600">மொத்த தொகை:</span>
                    <span className="text-lg">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-3xl bg-white p-4 shadow-soft">
              <h2 className="text-lg font-semibold">Customer</h2>
              <p className="mt-2 text-sm text-slate-500">Enter phone number to send bill.</p>
              <label className="mt-4 block text-sm font-medium text-slate-700">
                Name
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer name"
                  className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-4 text-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </label>

              <label className="mt-4 block text-sm font-medium text-slate-700">
                Phone
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  placeholder="10-digit number"
                  className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-4 text-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </label>
            </div>

            <div className="rounded-3xl bg-white p-4 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Bill Summary</h2>
                  <p className="text-sm text-slate-500">Review totals before sending.</p>
                </div>
              </div>

              <div className="space-y-3 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
                <div className="border-t border-slate-200 pt-4 text-base font-semibold">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[5, 10].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setQuickDiscount(value)}
                    className={`rounded-3xl px-4 py-3 text-sm font-semibold transition ${discount === value ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    -{value}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleSendBill}
                  disabled={loading}
                  className="w-full rounded-3xl bg-sky-600 px-4 py-4 text-lg font-semibold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Preparing bill…' : 'Send Bill'}
                </button>
                <button
                  type="button"
                  onClick={handlePrintBill}
                  disabled={loading || cart.length === 0}
                  className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-lg font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Print Bill
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-4 shadow-soft">
              <h2 className="text-lg font-semibold">Tips</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>Tap any product card to add it to the bill instantly.</li>
                <li>Edit the rate directly when bargaining.</li>
                <li>Switch between KG and PADI instantly.</li>
              </ul>
            </div>
          </aside>
        </main>

        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-semibold">Select unit for {selectedProduct.tamilName || selectedProduct.name}</h3>
              {selectedProduct.tamilName && (
                <p className="mt-2 text-sm text-slate-500">{selectedProduct.tamilName}</p>
              )}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedWeightType('KG');
                    setSelectedRate(String(selectedProduct.ratePerKg));
                    setError('');
                  }}
                  aria-pressed={selectedWeightType === 'KG'}
                  className={`flex flex-col items-center gap-1 rounded-3xl px-4 py-4 text-sm font-semibold transition ${selectedWeightType === 'KG' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  <span>{getTamilUnit('KG')} (KG)</span>
                  <span className="text-base">{formatCurrency(selectedProduct.ratePerKg)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedWeightType('PADI');
                    setSelectedRate(String(selectedProduct.ratePerPadi));
                    setError('');
                  }}
                  aria-pressed={selectedWeightType === 'PADI'}
                  className={`flex flex-col items-center gap-1 rounded-3xl px-4 py-4 text-sm font-semibold transition ${selectedWeightType === 'PADI' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  <span>{getTamilUnit('PADI')} (PADI)</span>
                  <span className="text-base">{formatCurrency(selectedProduct.ratePerPadi)}</span>
                </button>
              </div>
              <label className="mt-5 block text-sm font-medium text-slate-700">
                Custom price ({selectedWeightType === 'KG' ? 'per KG' : 'per PADI'})
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={selectedRate}
                  onChange={(event) => {
                    setSelectedRate(event.target.value);
                    setError('');
                  }}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </label>
              <label className="mt-4 block text-sm font-medium text-slate-700">
                Quantity ({selectedWeightType === 'KG' ? 'KG' : 'PADI'})
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={selectedQuantity}
                  onChange={(event) => {
                    setSelectedQuantity(event.target.value);
                    setError('');
                  }}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </label>
              <p className="mt-3 text-right text-sm font-semibold text-slate-700">
                Total: {formatCurrency((Number(selectedRate) || 0) * (Number(selectedQuantity) || 0))}
              </p>
              {error && (
                <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>
              )}
              <button
                type="button"
                onClick={confirmWeightSelection}
                className="mt-5 w-full rounded-3xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700"
              >
                Add to bill
              </button>
              <button
                type="button"
                onClick={closeWeightSelection}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <section id="printable-bill" className="hidden print:block" aria-hidden="true">
          <div className="mx-auto max-w-[80mm] p-4 font-mono text-xs text-black">
            <header className="border-b border-dashed border-black pb-3 text-center">
              <h1 className="text-lg font-bold">Babu Grocery Shop</h1>
              <p>Grocery / Pulses Shop</p>
              <p className="mt-2">{new Date().toLocaleString('en-IN')}</p>
            </header>

            {(customerName.trim() || phone) && (
              <div className="border-b border-dashed border-black py-3">
                {customerName.trim() && <p>Customer: {customerName.trim()}</p>}
                {phone && <p>Phone: {phone}</p>}
              </div>
            )}

            <table className="my-3 w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-black">
                  <th className="py-1">Item</th>
                  <th className="px-1 py-1 text-right">Qty</th>
                  <th className="px-1 py-1 text-right">Rate</th>
                  <th className="py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id} className="border-b border-dashed border-slate-400">
                    <td className="py-2">
                      <span>{item.tamilName || item.name}</span>
                      <span className="block">{getTamilUnit(item.weightType)}</span>
                    </td>
                    <td className="px-1 py-2 text-right">{item.quantity}</td>
                    <td className="px-1 py-2 text-right">{formatCurrency(item.rate)}</td>
                    <td className="py-2 text-right">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-1 border-t border-dashed border-black pt-3 text-right">
              <p>Subtotal: {formatCurrency(subtotal)}</p>
              <p>Discount: -{formatCurrency(discount)}</p>
              <p className="pt-2 text-base font-bold">Total: {formatCurrency(totalAmount)}</p>
            </div>
            <footer className="mt-5 border-t border-dashed border-black pt-3 text-center">
              <p>நன்றி! மீண்டும் வருக!</p>
            </footer>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
