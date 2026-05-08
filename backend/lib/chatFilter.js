function filterMessageContent(content) {
  const phoneRegex = /(?:\+?\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}/g;
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;

  const hasPhone = phoneRegex.test(content);
  const hasEmail = emailRegex.test(content);
  const hasLink = linkRegex.test(content);

  const isRestricted = hasPhone || hasEmail || hasLink;

  return {
    isRestricted,
    reasons: {
      phone: hasPhone,
      email: hasEmail,
      link: hasLink
    }
  };
}

module.exports = { filterMessageContent };
