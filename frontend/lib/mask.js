export function maskEmail(email) {
  if (!email) return email;
  const [name, domain] = email.split('@');
  if (!domain) return email;
  const maskedName = name.length <= 2
    ? name[0] + '***'
    : name[0] + '***' + name[name.length - 1];
  return `${maskedName}@${domain}`;
}

export function maskPhone(phone) {
  if (!phone) return phone;
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length < 6) return phone;
  const last4 = cleaned.slice(-4);
  const prefix = cleaned.length > 10 ? '+' + cleaned.slice(0, cleaned.length - 10) : '';
  return `${prefix}******${last4}`;
}

export function maskSensitiveData(obj, options = {}) {
  const {
    maskEmailFields = ['email'],
    maskPhoneFields = ['phone', 'phoneNumber'],
  } = options;

  const masked = { ...obj };
  for (const field of maskEmailFields) {
    if (masked[field]) masked[field] = maskEmail(masked[field]);
  }
  for (const field of maskPhoneFields) {
    if (masked[field]) masked[field] = maskPhone(masked[field]);
  }
  return masked;
}
