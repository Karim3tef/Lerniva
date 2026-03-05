export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'خطأ في التحقق من صحة البيانات',
      details: err.message,
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'غير مصرح' });
  }

  if (err.code === '23505') { // PostgreSQL unique violation
    return res.status(409).json({ error: 'هذه البيانات موجودة بالفعل' });
  }

  if (err.code === '23503') { // PostgreSQL foreign key violation
    return res.status(400).json({ error: 'العنصر المطلوب غير موجود' });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'حدث خطأ في الخادم',
  });
};
