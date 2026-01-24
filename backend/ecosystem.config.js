module.exports = {
    apps: [{
        name: 'agri-loop-api',
        script: '../node_modules/next/dist/bin/next',
        args: 'start -p 2026',
        env: {
            NODE_ENV: 'production',
            PORT: 2026
        },
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        error_file: "./logs/err.log",
        out_file: "./logs/out.log",
        time: true
    }]
};
