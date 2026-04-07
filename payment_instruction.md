

# 🚀 1. Project Architecture

Your landing page + YooKassa will work like this:

```
[Frontend: React / Landing Page]
        |
        | POST /create-payment
        v
[Backend: Node.js on Timeweb]
        |
        | API call
        v
[YooKassa API]  <--- returns a payment link
        |
        | redirect user
        v
[Frontend] → user completes payment
        |
        | Webhook POST /webhook
        v
[Backend] → stores payment info + participant details
```

---

# 🟢 2. What needs to be set up in the project

## **A. Frontend**

1. “Buy Ticket” button
2. Form for user details (name, email, ticket type)
3. JS code to call backend `/create-payment` and redirect user to YooKassa:

```js
const handleBuy = async () => {
  const res = await fetch('https://your-domain.com/create-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'John Doe',
      email: 'john@example.com',
      ticket_type: 'VIP'
    })
  });
  const data = await res.json();
  window.location.href = data.confirmation_url;
};
```

---

## **B. Backend (Node.js on Timeweb)**

**File structure:**

```
backend/
├─ index.js          # main server
├─ package.json
└─ .env              # secret keys
```

**Example `index.js`:**

```js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const YooKassa = require('yookassa');

const app = express();
app.use(bodyParser.json());

const client = new YooKassa({
  shopId: process.env.YOOKASSA_SHOP_ID,
  secretKey: process.env.YOOKASSA_SECRET_KEY
});

// Create a payment
app.post('/create-payment', async (req, res) => {
  const { name, email, ticket_type } = req.body;
  const price = ticket_type === 'VIP' ? '10000.00' : '5000.00';

  const payment = await client.createPayment({
    amount: { value: price, currency: 'RUB' },
    confirmation: { type: 'redirect', return_url: 'https://your-domain.com/success' },
    capture: true,
    description: `Ticket ${ticket_type} — ${name}`,
    metadata: { name, email, ticket_type }
  });

  res.json({ confirmation_url: payment.confirmation.confirmation_url });
});

// Webhook to receive payment notifications
app.post('/webhook', async (req, res) => {
  const event = req.body;

  if (event.event === 'payment.succeeded') {
    const payment = event.object;
    console.log('Payment succeeded:', payment.metadata);
    // Save to database or CSV
  }

  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running...');
});
```

**.env**

```
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key
```

---

## **C. Database (optional)**

* For just 35 participants, you can store data in a simple CSV or JSON file
* Or use SQLite / MySQL on Timeweb if needed

---

# 🟢 3. Timeweb Setup

1. Get VPS or Node.js hosting
2. Upload backend files (`index.js`, `package.json`)
3. Set up your domain (e.g., `payments.yourdomain.com`)
4. Configure Node.js server to be publicly accessible
5. Add SSL (HTTPS required by YooKassa)
6. Verify backend URL: `https://your-domain.com/create-payment`

---

# 🟢 4. YooKassa Setup

1. Create a store in YooKassa dashboard
2. Get `shopId` and `secretKey`
3. Set **Webhook URL**: `https://your-domain.com/webhook`
4. Test with sandbox/test payment
5. Ensure metadata (name/email/ticket) is passed and logged

---

# 🟢 5. Frontend + Backend connection

* React frontend calls backend → backend creates payment → returns payment link → frontend redirects
* After payment, webhook → backend receives info → stores participant data

---

# 🟢 6. Testing

1. Create test payment → redirect to YooKassa
2. Complete test payment → check webhook
3. Verify that participant info (name, email, ticket) is saved → ready for real sales

---

# 🔥 Final Plan Summary

1. Landing page: GitHub Pages or Timeweb static
2. Backend: Node.js on Timeweb → create payment + webhook
3. YooKassa: configure shopId, secretKey, webhook
4. Test payments
5. Collect participant info automatically (name/email/ticket type)


