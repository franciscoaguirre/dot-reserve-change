// Helper function to print complex values.
export const stringify = (obj: any) => JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2);
