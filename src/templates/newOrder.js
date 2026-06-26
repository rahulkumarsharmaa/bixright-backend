// adminNewOrderTemplate.js

module.exports = (data) => {
  const {
    logoUrl,
    companyName,

    orderNumber,
    orderDate,
    orderTime,

    customerName,
    customerEmail,
    customerPhone,

    totalItems,
    subtotal,
    shippingCharge,
    discount = 0,
    tax,
    totalAmount,

    paymentMethod,
    paymentStatus,

    orderStatus,
    shippingMethod = "Courier",

    shippingAddress,

    orderItems, // Array
  } = data;

  const currentYear = new Date().getFullYear();

  const itemsHTML = orderItems
    ?.map(
      (item) => `
<tr>
<td style="padding:14px;border-bottom:1px solid #e2e8f0;">
${item.productName}
</td>

<td align="center" style="padding:14px;border-bottom:1px solid #e2e8f0;">
${item.quantity}
</td>

<td align="right" style="padding:14px;border-bottom:1px solid #e2e8f0;">
₹${item.price}
</td>

<td align="right" style="padding:14px;border-bottom:1px solid #e2e8f0;font-weight:600;">
₹${item.total}
</td>

</tr>
`,
    )
    .join("");

  return `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>New Order</title>
</head>

<body style="margin:0;padding:0;background:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:45px 0;background:#f6f9fc;">

<tr>

<td align="center">

<table width="650" cellpadding="0" cellspacing="0"
style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 5px 25px rgba(0,0,0,.06);">

<!-- Header -->

<tr>

<td align="center" style="background:#0f172a;padding:40px;">

<img src="${logoUrl}" width="64"/>

<h1 style="margin:20px 0 5px;color:#fff;font-size:26px;">
🛒 New Order Received
</h1>

<p style="margin:0;color:#94a3b8;">
A new customer order has been successfully placed.
</p>

</td>

</tr>

<!-- Alert -->

<tr>

<td style="padding:30px 40px;">

<div style="background:#ecfdf5;border-left:5px solid #16a34a;padding:20px;border-radius:12px;">

<div style="font-size:18px;font-weight:700;color:#166534;margin-bottom:8px;">
Order Notification
</div>

<div style="color:#475569;line-height:24px;">

A new order has been placed and is awaiting processing.

Please review the order details below.

</div>

</div>

</td>

</tr>

<!-- Order Details -->

<tr>

<td style="padding:0 40px;">

<h2 style="margin-bottom:18px;">
Order Information
</h2>

<table width="100%" cellpadding="0" cellspacing="0"
style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">

<tr>

<td style="padding:14px 18px;background:#fafafa;font-weight:600;width:180px;">
Order Number
</td>

<td style="padding:14px 18px;font-family:monospace;font-weight:700;">
${orderNumber}
</td>

</tr>

<tr>

<td style="padding:14px 18px;background:#fafafa;font-weight:600;">
Order Date
</td>

<td style="padding:14px 18px;">
${orderDate}
</td>

</tr>

<tr>

<td style="padding:14px 18px;background:#fafafa;font-weight:600;">
Order Time
</td>

<td style="padding:14px 18px;">
${orderTime}
</td>

</tr>

<tr>

<td style="padding:14px 18px;background:#fafafa;font-weight:600;">
Order Status
</td>

<td style="padding:14px 18px;">

<span style="background:#dbeafe;color:#1d4ed8;padding:5px 12px;border-radius:6px;font-size:12px;font-weight:700;">
${orderStatus}
</span>

</td>

</tr>

<tr>

<td style="padding:14px 18px;background:#fafafa;font-weight:600;">
Payment Status
</td>

<td style="padding:14px 18px;">

<span style="background:#dcfce7;color:#15803d;padding:5px 12px;border-radius:6px;font-size:12px;font-weight:700;">
${paymentStatus}
</span>

</td>

</tr>

<tr>

<td style="padding:14px 18px;background:#fafafa;font-weight:600;">
Payment Method
</td>

<td style="padding:14px 18px;">
${paymentMethod}
</td>

</tr>

<tr>

<td style="padding:14px 18px;background:#fafafa;font-weight:600;">
Shipping
</td>

<td style="padding:14px 18px;">
${shippingMethod}
</td>

</tr>

</table>

</td>

</tr>

<!-- Customer -->

<tr>

<td style="padding:35px 40px 0;">

<h2>
Customer Information
</h2>

<table width="100%" cellpadding="0" cellspacing="0"
style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">

<tr>

<td style="padding:14px;background:#fafafa;font-weight:600;width:180px;">
Name
</td>

<td style="padding:14px;">
${customerName}
</td>

</tr>

<tr>

<td style="padding:14px;background:#fafafa;font-weight:600;">
Email
</td>

<td style="padding:14px;">
${customerEmail}
</td>

</tr>

<tr>

<td style="padding:14px;background:#fafafa;font-weight:600;">
Phone
</td>

<td style="padding:14px;">
${customerPhone}
</td>

</tr>

<tr>

<td style="padding:14px;background:#fafafa;font-weight:600;">
Shipping Address
</td>

<td style="padding:14px;line-height:24px;">
${shippingAddress}
</td>

</tr>

</table>

</td>

</tr>

<!-- Items -->

<tr>

<td style="padding:35px 40px 0;">

<h2>
Ordered Items (${totalItems})
</h2>

<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">

<tr style="background:#0f172a;color:#fff;">

<th align="left" style="padding:14px;">
Product
</th>

<th>
Qty
</th>

<th align="right">
Price
</th>

<th align="right">
Total
</th>

</tr>

${itemsHTML}

</table>

</td>

</tr>

<!-- Summary -->

<tr>

<td style="padding:35px 40px;">

<table width="320" align="right">

<tr>

<td>Subtotal</td>

<td align="right">
₹${subtotal}
</td>

</tr>

<tr>

<td>Shipping</td>

<td align="right">
₹${shippingCharge}
</td>

</tr>

<tr>

<td>Discount</td>

<td align="right">
- ₹${discount}
</td>

</tr>

<tr>

<td>Tax</td>

<td align="right">
₹${tax}
</td>

</tr>

<tr>

<td style="padding-top:15px;font-size:18px;font-weight:700;">
Grand Total
</td>

<td align="right" style="padding-top:15px;font-size:22px;font-weight:700;color:#16a34a;">
₹${totalAmount}
</td>

</tr>

</table>

</td>

</tr>

<!-- Footer -->

<tr>

<td style="background:#f8fafc;padding:30px;text-align:center;border-top:1px solid #e2e8f0;">

<p style="margin:0;color:#64748b;font-size:13px;">
This is an automated order notification generated by your ecommerce platform.
</p>

<p style="margin-top:10px;color:#94a3b8;font-size:12px;">
© ${currentYear} ${companyName}. All Rights Reserved.
</p>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
`;
};
