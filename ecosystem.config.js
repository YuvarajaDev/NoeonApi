module.exports = {
  apps: [
    {
      name: 'neon-api',
      script: './index.js',
      instances: 1, // Number of instances (1 for single instance, 'max' for all CPU cores)
      exec_mode: 'fork', // 'cluster' or 'fork'
      autorestart: true,
      watch: false, // Set to true for development, false for production
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
    },
  ],
};
