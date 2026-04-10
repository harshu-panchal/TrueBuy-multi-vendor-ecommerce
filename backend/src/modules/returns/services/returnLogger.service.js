const formatContext = (context = {}) => {
    try {
        return JSON.stringify(context);
    } catch {
        return '{}';
    }
};

export const logReturnInfo = (message, context = {}) => {
    console.info(`[returns] ${message} ${formatContext(context)}`);
};

export const logReturnWarn = (message, context = {}) => {
    console.warn(`[returns] ${message} ${formatContext(context)}`);
};

export const logReturnError = (message, context = {}) => {
    console.error(`[returns] ${message} ${formatContext(context)}`);
};

