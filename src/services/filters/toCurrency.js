export default (value) => {
  if (typeof value !== 'number') {
    return value;
  }

  const formatter = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  });

  return formatter.format(value);
};
