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
        max_memory_restart: '500M',
        error_file: '/var/log/pm2/agri-loop-error.log',
        out_file: '/var/log/pm2/agri-loop-out.log',
    }]
};
