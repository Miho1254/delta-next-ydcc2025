module.exports = {
    apps: [{
        name: 'agri-loop-api',
        script: 'npm',
        args: 'start',
        cwd: '/var/www/agri-loop/backend',
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
