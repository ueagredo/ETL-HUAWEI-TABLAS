"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParams = void 0;
const getParams = () => {
    const processArgs = process.argv.slice(2);
    return processArgs.reduce((params, arg) => {
        const [key, ...rest] = arg.split('=');
        if (key) {
            const value = rest.length > 0 ? rest.join('=') : null;
            params[key] = value;
            try {
                params[key] = JSON.parse(value);
            }
            catch (_) { }
        }
        return params;
    }, {});
};
exports.getParams = getParams;
