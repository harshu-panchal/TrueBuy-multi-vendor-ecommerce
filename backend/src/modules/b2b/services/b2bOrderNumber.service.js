const randomToken = (len = 6) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < len; i += 1) {
        out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
};

export const generateB2BOrderNumber = () => {
    const ts = Date.now().toString(36).toUpperCase();
    return `B2B-${ts}-${randomToken(6)}`;
};

