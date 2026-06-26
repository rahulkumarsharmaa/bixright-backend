// registrationTemplate.js
module.exports = (data) => {
  // Destructure the values for clean usage inside the template
  const {
    logoUrl,
    customerName,
    customerEmail,
    phone,
    registrationDate,
    registrationTime,
    customerId,
    companyName,
  } = data;

  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>New User Registration</title>
</head>
<body style="margin:0;padding:0;background:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f9fc;padding:48px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);border:1px solid #eef2f6;">

<tr>
<td align="center" style="background:#0f172a;padding:40px 40px 35px;">
<img src="${logoUrl}" width="64" height="64" alt="Logo" style="display:block;border-radius:12px;object-fit:contain;">
<h1 style="margin:20px 0 0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.02em;">
  New Customer Registration
</h1>
<p style="color:#94a3b8;font-size:15px;margin:8px 0 0;line-height:1.5;">
  A new customer account has been successfully provisioned.
</p>
</td>
</tr>

<tr>
<td style="padding:32px 40px 16px;">
<div style="background:#f0f7ff;border-left:4px solid #2563eb;padding:20px;border-radius:12px;">
<span style="font-size:16px;font-weight:700;color:#1e40af;display:inline-block;margin-bottom:6px;">
  🎉 Registration Alert
</span>
<p style="margin:0;color:#475569;font-size:14px;line-height:24px;">
  A new customer has officially joined your platform. Their account is active, verified, and completely ready for future transactions.
</p>
</div>
</td>
</tr>

<tr>
<td style="padding:16px 40px 40px;">
<h2 style="margin:0 0 16px;color:#0f172a;font-size:16px;font-weight:700;letter-spacing:-0.01em;">
  Customer Profile Information
</h2>

<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;border-collapse:separate;">
<tr>
<td style="color:#64748b;font-size:14px;padding:14px 20px;width:160px;font-weight:600;border-bottom:1px solid #e2e8f0;background:#fafafa;">Full Name</td>
<td style="color:#0f172a;font-size:14px;padding:14px 20px;font-weight:500;border-bottom:1px solid #e2e8f0;">${customerName}</td>
</tr>
<tr>
<td style="color:#64748b;font-size:14px;padding:14px 20px;font-weight:600;border-bottom:1px solid #e2e8f0;background:#fafafa;">Email Address</td>
<td style="color:#2563eb;font-size:14px;padding:14px 20px;font-weight:500;border-bottom:1px solid #e2e8f0;word-break:break-all;">${customerEmail}</td>
</tr>
<tr>
<td style="color:#64748b;font-size:14px;padding:14px 20px;font-weight:600;border-bottom:1px solid #e2e8f0;background:#fafafa;">Phone Number</td>
<td style="color:#0f172a;font-size:14px;padding:14px 20px;font-weight:500;border-bottom:1px solid #e2e8f0;">${phone}</td>
</tr>
<tr>
<td style="color:#64748b;font-size:14px;padding:14px 20px;font-weight:600;border-bottom:1px solid #e2e8f0;background:#fafafa;">Registration Date</td>
<td style="color:#0f172a;font-size:14px;padding:14px 20px;font-weight:500;border-bottom:1px solid #e2e8f0;">${registrationDate}</td>
</tr>
<tr>
<td style="color:#64748b;font-size:14px;padding:14px 20px;font-weight:600;border-bottom:1px solid #e2e8f0;background:#fafafa;">Registration Time</td>
<td style="color:#0f172a;font-size:14px;padding:14px 20px;font-weight:500;border-bottom:1px solid #e2e8f0;">${registrationTime}</td>
</tr>
<tr>
<td style="color:#64748b;font-size:14px;padding:14px 20px;font-weight:600;border-bottom:1px solid #e2e8f0;background:#fafafa;">Customer ID</td>
<td style="color:#334155;font-size:14px;padding:14px 20px;font-weight:600;font-family:monospace;border-bottom:1px solid #e2e8f0;">${customerId}</td>
</tr>
<tr>
<td style="color:#64748b;font-size:14px;padding:14px 20px;font-weight:600;background:#fafafa;">Account Status</td>
<td style="padding:14px 20px;">
<span style="background:#ecfdf5;color:#059669;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:600;border:1px solid #a7f3d0;display:inline-block;letter-spacing:0.02em;">ACTIVE</span>
</td>
</tr>
</table>
</td>
</tr>

<tr>
<td style="background:#f8fafc;padding:32px;text-align:center;border-top:1px solid #e2e8f0;">
<p style="color:#64748b;margin:0;font-size:13px;line-height:20px;">
  This is an automated notification system from your dashboard backend.
</p>
<p style="color:#94a3b8;font-size:12px;margin:10px 0 0;">
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
