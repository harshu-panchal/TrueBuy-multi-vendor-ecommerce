/**
 * Generates a unique order ID: ORD-{timestamp}-{random4}
 */
export const generateOrderId = () => {
    // Generates an 8-character random alphanumeric string
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `ORD-${random}`;
};
